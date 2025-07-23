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

onMounted(async () => {
  if (!postId) return

  try {
    const docRef = doc(firestore, 'posts', postId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      postData.value = docSnap.data()

      const repostQuery = query(
        collection(firestore, 'posts'),
        where('originalPostId', '==', postId)
      )
      const repostSnap = await getDocs(repostQuery)
      reposts.value = repostSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => r.lat != null && r.lng != null)

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

          // Fallback to first repost if original is missing lat/lng
          let center
          if (lat.value != null && lng.value != null) {
            center = [lat.value, lng.value]
          } else if (reposts.value.length > 0) {
            center = [reposts.value[0].lat, reposts.value[0].lng]
          } else {
            console.warn('No valid coordinates to center map.')
            return
          }

          map.value = L.map('map', { zoomControl: true }).setView(center, 13)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map.value)

          setTimeout(() => map.value.invalidateSize(), 200)

          // Original post marker
          if (lat.value != null && lng.value != null) {
            L.marker([lat.value, lng.value]).addTo(map.value)
              .bindPopup(postData.value.title || 'Original Post')
              .openPopup()
          }

          // Repost heat layer
          const heatPoints = reposts.value.map(r => [r.lat, r.lng, 0.7])
          if (heatPoints.length > 0) {
            const heatLayer = L.heatLayer(heatPoints, {
              radius: 20,
              blur: 15,
              maxZoom: 17
            }).addTo(map.value)

            const bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]))
            map.value.fitBounds(bounds.pad(0.2))
          }

          // 🔁 Add marker for each repost
          reposts.value.forEach(repost => {
            const marker = L.marker([repost.lat, repost.lng]).addTo(map.value)
            const popupContent = `
              <strong>@${repost.authorUsername}</strong><br>
              <em>${repost.highlightedQuote || ''}</em><br>
              ${repost.repostComment || ''}
            `
            marker.bindPopup(popupContent)
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