<template>
  <div v-if="!loading">
    <Visual v-if="postId" :post-id="postId" />

    <div v-if="latLngReady" id="map"></div>
    <div v-else>Map data not available</div>

    <div v-if="reposts.length" class="legend-and-feed">
      <div id="map-legend" class="map-legend">
        <h4>Legend</h4>
        <div><span class="circle-sample"></span> Repost location</div>
        <div class="heat-label">Heatmap intensity</div>
        <div class="heat-gradient">
          <span class="label">Low</span>
          <div class="gradient-bar"></div>
          <span class="label">High</span>
        </div>
      </div>

      <div class="repost-feed">
        <h3>Reposts</h3>
        <ul>
          <li v-for="repost in reposts" :key="repost.id">
            <a href="#" @click.prevent="showMarkerPopup(repost.id)">
              <strong>@{{ repost.authorUsername }}</strong>:
              <span v-if="repost.highlightedQuote">“{{ repost.highlightedQuote }}”</span>
            </a>
            <span v-if="repost.repostComment"> — {{ repost.repostComment }}</span>
          </li>
        </ul>
        <button v-if="selectedMarkerId" @click="clearSelection" class="clear-btn">Clear Selection</button>
      </div>
    </div>

    <div class="back-button-container">
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
const markerMap = {} // ✅ New: map of repost.id => marker
const selectedMarkerId = ref(null)

const lat = computed(() => postData.value?.lat)
const lng = computed(() => postData.value?.lng)
const latLngReady = computed(() =>
  (lat.value != null && lng.value != null) || reposts.value.length > 0
)

const isInYongsan = (lat, lng) => lat >= 37.525 && lat <= 37.555 && lng >= 126.960 && lng <= 126.995

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
  Object.keys(markerMap).forEach(id => delete markerMap[id])
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
      markerMap[repost.id] = marker
    }
  })
}

function showMarkerPopup(id) {
  const marker = markerMap[id]
  if (marker && map.value) {
    marker.openPopup()
    map.value.setView(marker.getLatLng(), Math.max(map.value.getZoom(), 15))
    selectedMarkerId.value = id
  }
}

function clearSelection() {
  if (selectedMarkerId.value && markerMap[selectedMarkerId.value]) {
    markerMap[selectedMarkerId.value].closePopup()
  }
  selectedMarkerId.value = null
}

onMounted(async () => {
  if (!postId) return

  try {
    const docRef = doc(firestore, 'posts', postId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      postData.value = docSnap.data()

      if (!isInYongsan(postData.value.lat, postData.value.lng)) {
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
          if (!isInYongsan(r.lat, r.lng)) {
            const coords = getRandomYongsanLatLng()
            r.lat = coords.lat
            r.lng = coords.lng
          }
          return r
        })

      await nextTick()

      setTimeout(() => {
        const mapContainer = document.getElementById('map')
        if (!mapContainer) return

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

          L.marker(center).addTo(map.value).bindPopup('Original Post Location').openPopup()

          function updateMarkersRadius() {
            const zoom = map.value.getZoom()
            let radius = zoom >= 17 ? 4 : zoom >= 15 ? 3 : zoom >= 13 ? 2 : 1
            addRepostMarkers(radius)
          }

          map.value.on('zoomend', updateMarkersRadius)
          updateMarkersRadius()

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

.legend-and-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 20px;
}

@media (min-width: 768px) {
  .legend-and-feed {
    flex-direction: row;
    align-items: flex-start;
  }

  .map-legend {
    flex: 0 0 240px;
  }

  .repost-feed {
    flex: 1;
  }
}

.map-legend {
  background: #ffffff;
  color: #222;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
  font-size: 0.9rem;
  max-width: 240px;
}

.map-legend h4 {
  margin-top: 0;
  margin-bottom: 6px;
  font-size: 1rem;
  color: #003348;
}

.circle-sample {
  background-color: #3388ff;
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
}

.heat-label {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: bold;
  color: #004a6e;
}

.heat-gradient {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gradient-bar {
  flex-grow: 1;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, rgba(0, 255, 255, 0.4), orange, red);
  border: 1px solid #ccc;
  width: 100px;
}

.label {
  font-size: 0.75rem;
  color: #333;
}

.repost-feed {
  background: #f8fbfd;
  border: 1px solid #d4e2ea;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #003348;
}

.repost-feed h3 {
  margin-top: 0;
  color: #003348;
}

.repost-feed ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.repost-feed li {
  margin-bottom: 0.75rem;
}

.repost-feed a {
  color: #005b8f;
  text-decoration: none;
}

.repost-feed a:hover {
  text-decoration: underline;
}

.clear-btn {
  margin-top: 1rem;
  background-color: #ccc;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s ease;
}

.clear-btn:hover {
  background-color: #aaa;
}

.back-button-container {
  margin-top: 1rem;
  text-align: left;
}

.back-link {
  display: inline-block;
  padding: 0.4rem 1rem;
  background-color: #7b91a0;
  color: white;
  border-radius: 5px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.back-link:hover {
  background-color: #62b3be;
}
</style>