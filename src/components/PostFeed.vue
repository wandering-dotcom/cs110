<template>
  <div class="post-feed">
    <h2>Posts</h2>
    <div v-if="loading">Loading posts...</div>
    <div v-else-if="posts.length === 0">
      <p>No posts yet.</p>
    </div>
    <div v-else>
      <PostItem v-for="post in postsToShow" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { store } from '../stores/store.js'
import { firestore } from '../firebaseResources.js'
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore'
import PostItem from './PostItem.vue'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  }
})

const internalPosts = ref([])
const loading = ref(true)

async function fetchPosts() {
  loading.value = true
  try {
    if (store.currentUser) {
      // Fetch posts for logged in user (only from their feed)
      const userRef = doc(firestore, 'users', store.currentUser.uid)
      const userSnap = await getDoc(userRef)
      const feedIds = userSnap.data().feed || []

      if (feedIds.length === 0) {
        internalPosts.value = []
      } else {
        const chunk = feedIds.slice(0, 10)
        const postDocs = await Promise.all(
          chunk.map(id => getDoc(doc(firestore, 'posts', id)))
        )
        internalPosts.value = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } else {
      // Not logged in: show global posts
      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const snapshot = await getDocs(postQuery)
      internalPosts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    internalPosts.value = []
  } finally {
    loading.value = false
  }
}

const postsToShow = computed(() => {
  // If parent passes posts, use them; else use internalPosts
  const source = props.posts.length > 0 ? props.posts : internalPosts.value
  return [...source].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

watch(() => props.posts, (newVal) => {
  if (newVal.length > 0) {
    loading.value = false
  } else {
    // Only fetch if no posts passed as prop
    fetchPosts()
  }
}, { immediate: true })

onMounted(() => {
  if (props.posts.length === 0) {
    fetchPosts()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.post-feed {
  border: 3px solid #ddd;
  background: rgba(189, 240, 245, 0.672);
  margin-bottom: 1rem;
  padding: 0.5rem;
}

h2 {
  margin-bottom: 0rem;
}
</style>