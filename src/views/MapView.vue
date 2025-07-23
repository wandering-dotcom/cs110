<template>
  <div v-if="!loading">
    <Visual v-if="postId" :post-id="postId" />

    <div v-if="latLngReady" id="map"></div>
    <div v-else>Map data not available</div>

    <div id="map-legend" class="map-legend">
    <h4>Legend</h4>
    <div><span class="circle-sample"></span> Repost location</div>
    <div><span class="heat-sample"></span> Heatmap intensity</div>
    </div>

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
const markers = []

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

function clearMarkers() {
  markers.forEach(marker => map.value.removeLayer(marker))
  markers.length = 0
}

function addRepostMarkers(radius) {
  clearMarkers()
  reposts.value.forEach(repost => {
    if (isInYongsan(repost.lat, repost.lng)) {
      const marker = L.circleMarker([repost.lat, repost.lng], {
        radius,
        fillColor: '#3388ff',
        color: '#3388ff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map.value)

      const popupContent = `
        <strong>@${repost.authorUsername}</strong><br>
        <em>${repost.highlightedQuote || ''}</em><br>
        ${repost.repostComment || ''}
      `
      marker.bindPopup(popupContent)
      markers.push(marker)
    }
  })
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

          const center = [lat.value, lng.value]

          map.value = L.map('map', { zoomControl: true }).setView(center, 15)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map.value)

          setTimeout(() => map.value.invalidateSize(), 200)

          // Original marker (default icon)
          L.marker(center).addTo(map.value).bindPopup('Original Post Location').openPopup()

          // Add repost circle markers with radius depending on zoom
          function updateMarkersRadius() {
            const zoom = map.value.getZoom()
            // Adjust radius by zoom level (example logic)
            let radius = 2
            if (zoom >= 17) radius = 4
            else if (zoom >= 15) radius = 3
            else if (zoom >= 13) radius = 2
            else radius = 1

            addRepostMarkers(radius)
          }

          map.value.on('zoomend', updateMarkersRadius)
          updateMarkersRadius()

          // Heatmap layer for repost locations
          const heatPoints = reposts.value.map(r => [r.lat, r.lng, 0.6])
            const heat = L.heatLayer(heatPoints, {
            radius: 25,
            maxZoom: 17,
            blur: 20,
            max: 1.0
            }).addTo(map.value)
                    }
      }, 1500)
    }
  } catch (error) {
    console.error('Error loading post or repost data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  margin-top: 12px;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
}

.repost-feed {
  margin-top: 20px;
}

.back-link {
  display: inline-block;
  margin-top: 10px;
  color: #555;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  font-size: 0.9rem;
  z-index: 999;
  color: black;
}

.circle-sample,
.heat-sample {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
}

.circle-sample {
  background-color: #3388ff;
}

.heat-sample {
  background: linear-gradient(135deg, orange, red);
}
</style>