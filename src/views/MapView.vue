<template>
  <div v-if="!loading">
    <Visual v-if="postId" :post-id="postId" />

    <div v-if="latLngReady" id="map"></div>
    <div v-else>Map data not available</div>

    <div v-if="reposts.length" class="repost-feed">
      <h3>Reposts</h3>
      <ul>
        <li v-for="repost in reposts" :key="repost.id">
          <router-link :to="`/post/${repost.originalPostId}`">
            <strong>@{{ repost.authorUsername }}</strong>:
            <span v-if="repost.highlightedQuote">“{{ repost.highlightedQuote }}”</span>
          </router-link>
          <span v-if="repost.repostComment"> — {{ repost.repostComment }}</span>
        </li>
      </ul>
      <router-link to="/" class="back-link">← Back to Feed</router-link>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import Visual from '../components/Visual.vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const route = useRoute()
const postId = route.params.postId
const postData = ref(null)
const reposts = ref([])
const loading = ref(true)
const map = ref(null)

const lat = computed(() => postData.value?.lat)
const lng = computed(() => postData.value?.lng)
const latLngReady = computed(() =>
  (lat.value != null && lng.value != null) || reposts.value.length > 0
)

// Yongsan-gu bounding box
const isInYongsan = (lat, lng) => {
  return lat >= 37.525 && lat <= 37.555 && lng >= 126.960 && lng <= 126.995
}

// Generate random lat/lng inside Yongsan-gu
function getRandomYongsanLatLng() {
  const minLat = 37.525
  const maxLat = 37.555
  const minLng = 126.960
  const maxLng = 126.995
  return {
    lat: Math.random() * (maxLat - minLat) + minLat,
    lng: Math.random() * (maxLng - minLng) + minLng
  }
}

onMounted(async () => {
  if (!postId) return

  try {
    const docRef = doc(firestore, 'posts', postId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      postData.value = docSnap.data()

      if (
        postData.value.lat == null ||
        postData.value.lng == null ||
        !isInYongsan(postData.value.lat, postData.value.lng)
      ) {
        const randomCoords = getRandomYongsanLatLng()
        postData.value.lat = randomCoords.lat
        postData.value.lng = randomCoords.lng
      }

      const repostQuery = query(
        collection(firestore, 'posts'),
        where('originalPostId', '==', postId)
      )
      const repostSnap = await getDocs(repostQuery)
      reposts.value = repostSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .map(r => {
          if (
            r.lat == null ||
            r.lng == null ||
            !isInYongsan(r.lat, r.lng)
          ) {
            const randomCoords = getRandomYongsanLatLng()
            r.lat = randomCoords.lat
            r.lng = randomCoords.lng
          }
          return r
        })

      await nextTick()

      setTimeout(() => {
        const mapContainer = document.getElementById('map')
        if (!mapContainer) {
          console.error('Map container not found in DOM.')
          return
        }

        if (latLngReady.value) {
          if (map.value && map.value._leaflet_id) {
            map.value.remove()
          }

          let center = [lat.value, lng.value]

          map.value = L.map('map', { zoomControl: true }).setView(center, 15)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map.value)

          setTimeout(() => map.value.invalidateSize(), 200)

          // Original marker
          L.marker(center).addTo(map.value)
            .bindPopup(postData.value.title || 'Original Post')
            .openPopup()

          const heatPoints = reposts.value
            .filter(r => typeof r.lat === 'number' && typeof r.lng === 'number' && isInYongsan(r.lat, r.lng))
            .map(r => [r.lat, r.lng, 1])

          console.log('Heat points:', heatPoints)

          if (heatPoints.length > 0) {
            map.value.whenReady(() => {
              L.heatLayer(heatPoints, {
                radius: 40,
                blur: 25,
                maxZoom: 17,
                gradient: {
                  0.4: 'blue',
                  0.6: 'lime',
                  0.8: 'orange',
                  1.0: 'red'
                }
              }).addTo(map.value)

              const bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]))
              map.value.fitBounds(bounds.pad(0.1))

              setTimeout(() => map.value.invalidateSize(), 200)
            })
          }

          reposts.value.forEach(repost => {
            if (isInYongsan(repost.lat, repost.lng)) {
              const marker = L.marker([repost.lat, repost.lng]).addTo(map.value)
              const popupContent = `
                <strong>@${repost.authorUsername}</strong><br>
                <em>${repost.highlightedQuote || ''}</em><br>
                ${repost.repostComment || ''}
              `
              marker.bindPopup(popupContent)
            }
          })
        }
      }, 100)
    }
  } catch (err) {
    console.error('MapView failed:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
#map {
  height: 400px;
  width: 100%;
  margin-top: 1rem;
  border-radius: 6px;
  border: 2px solid #ccc;
}

.repost-feed {
  margin-top: 1rem;
  background: rgba(189, 240, 245, 0.672);
  border-radius: 6px;
  padding: 1rem;
}

.repost-feed ul {
  list-style: none;
  padding: 0;
  color: rgb(255, 255, 255);
}

.repost-feed li {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: rgb(66, 84, 84);
  border-radius: 4px;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #053136;
  text-decoration: none;
  font-weight: bold;
}

.back-link:hover {
  text-decoration: underline;
}
</style>