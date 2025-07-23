<template>
  <div v-if="!loading">
    <Visual v-if="authorUsername" :user="authorUsername" />
    <div v-if="latLngReady" id="map" style="height: 400px; width: 100%;"></div>
    <div v-else>Map data not available</div>

    <div v-if="reposts.length" class="repost-feed">
      <h3>Reposts</h3>
      <ul>
        <li v-for="repost in reposts" :key="repost.id">
          <strong>@{{ repost.authorUsername }}</strong>:
          <span v-if="repost.highlightedQuote">“{{ repost.highlightedQuote }}”</span>
          <span v-if="repost.repostComment"> — {{ repost.repostComment }}</span>
        </li>
      </ul>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat' // heatmap plugin
import Visual from '../components/Visual.vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const route = useRoute()
const postId = route.params.postId

const postData = ref(null)
const reposts = ref([])
const map = ref(null)
const loading = ref(true)

const authorUsername = computed(() => postData.value?.authorUsername || '')
const lat = computed(() => postData.value?.lat)
const lng = computed(() => postData.value?.lng)
const latLngReady = computed(() =>
  lat.value != null && lng.value != null || reposts.value.length > 0
)

onMounted(async () => {
  if (!postId) {
    loading.value = false
    return
  }

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

      if (latLngReady.value) {
        map.value = L.map('map').setView([lat.value, lng.value], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map.value)

        // Original marker
        L.marker([lat.value, lng.value]).addTo(map.value)
          .bindPopup(postData.value.title || 'Original Post')
          .openPopup()

        // Add heat layer
        const heatPoints = reposts.value.map(r => [r.lat, r.lng, 0.7]) // third value is intensity
        if (heatPoints.length > 0) {
          L.heatLayer(heatPoints, {
            radius: 20,
            blur: 15,
            maxZoom: 17
          }).addTo(map.value)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load post or reposts:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.repost-feed {
  margin-top: 1rem;
  background: rgba(189, 240, 245, 0.672);
  border-radius: 6px;
  padding: 1rem;
}

.repost-feed ul {
  list-style: none;
  padding: 0;
  color: rgb(86, 104, 106);
}

.repost-feed li {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}
</style>