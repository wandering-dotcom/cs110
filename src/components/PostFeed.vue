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
import { onMounted, ref, computed } from 'vue'
import { store } from '../stores/store.js'
import { firestore } from '../firebaseResources.js'
import {
  doc, getDoc,
  getDocs, collection,
  query, where, orderBy, limit
} from 'firebase/firestore'

import PostItem from './PostItem.vue'

const posts = ref([])
const loading = ref(true)

async function fetchPosts() {
  loading.value = true

  try {
    if (store.currentUser) {
      const userRef = doc(firestore, 'users', store.currentUser.uid)
      const userSnap = await getDoc(userRef)
      const feedIds = userSnap.data().feed || []

      if (feedIds.length === 0) {
        posts.value = []
      } else {
        const chunk = feedIds.slice(0, 10)
        const postDocs = await Promise.all(
          chunk.map(id => getDoc(doc(firestore, 'posts', id)))
        )
        posts.value = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } else {
      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const snapshot = await getDocs(postQuery)
      posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
  }
}

const postsToShow = computed(() =>
  [...posts.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
)

onMounted(fetchPosts)
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