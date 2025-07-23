<template>
  <div class="single-post-view">
    <h2>Post</h2>

    <div v-if="loading">Loading post...</div>
    <div v-else-if="!post">Post not found.</div>
    <div v-else>
      <PostItem :post="post" />

      <router-link to="/" class="back-link">
        ← Back to Feed
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'
import PostItem from '../components/PostItem.vue'

const route = useRoute()
const postId = route.params.postId

const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const snap = await getDoc(doc(firestore, 'posts', postId))
    if (snap.exists()) {
      const postData = { id: snap.id, ...snap.data() }

      // Attach username
      if (postData.authorId) {
        const userSnap = await getDoc(doc(firestore, 'users', postData.authorId))
        postData.authorUsername = userSnap.exists() ? userSnap.data().username : 'Unknown'
      }

      post.value = postData
    }
  } catch (err) {
    console.error('Failed to load post:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.single-post-view {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: rgba(189, 240, 245, 0.672);
  border-radius: 8px;
  border: 2px solid #ccc;
}

h2 {
  margin-bottom: 0rem;
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