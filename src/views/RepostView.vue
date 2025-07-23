<template>
  <div class="repost-view">
    <h2>Repost</h2>

    <div v-if="loading">Loading original post...</div>
    <div v-else-if="!originalPost">Post not found.</div>
    <div v-else>
      <PostItem :post="originalPost" />

        <Annotate
        :content="originalPost.content"
        @annotate="handleAnnotation"
        />

      <button @click="submitRepost">Repost</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { store } from '../stores/store'
import { firestore } from '../firebaseResources'
import PostItem from '../components/PostItem.vue'
import Annotate from '../components/Annotate.vue'

const route = useRoute()
const router = useRouter()

const postId = route.params.postId
const originalPost = ref(null)
const loading = ref(true)
const annotationData = ref({
  quote: useRoute().query.quote || '',
  comment: ''
})

function handleAnnotation(payload) {
  annotationData.value = payload
}

function getRandomLatLng() {
  // Example: worldwide
  const lat = (Math.random() * 180 - 90).toFixed(6) // -90 to +90
  const lng = (Math.random() * 360 - 180).toFixed(6) // -180 to +180
  return { lat: parseFloat(lat), lng: parseFloat(lng) }
}

onMounted(async () => {
  try {
    const snap = await getDoc(doc(firestore, 'posts', postId))
    if (snap.exists()) {
      const postData = { id: snap.id, ...snap.data() }
      const userSnap = await getDoc(doc(firestore, 'users', postData.authorId))
      postData.authorUsername = userSnap.exists() ? userSnap.data().username : 'Unknown'
      originalPost.value = postData
    }
  } catch (err) {
    console.error('Failed to load original post:', err)
  } finally {
    loading.value = false
  }
})

async function submitRepost() {
  const currentUser = store.currentUser
  if (!currentUser) {
    alert('You must be logged in to repost.')
    return
  }

  let username = currentUser.username
  if (!username) {
    // Manually fetch from users collection
    const userSnap = await getDoc(doc(firestore, 'users', currentUser.uid))
    username = userSnap.exists() ? userSnap.data().username : 'Unknown'
  }

  const { quote, comment } = annotationData.value
  const content = quote && comment
    ? `> ${quote}\n${comment}`
    : quote
    ? `> ${quote}`
    : comment || '[Repost]'

  const newRepost = {
    originalPostId: originalPost.value.id,
    originalAuthorId: originalPost.value.authorId,
    originalContent: originalPost.value.content,
    repostComment: comment,
    highlightedQuote: quote,
    content,
    authorId: currentUser.uid,
    authorUsername: username || 'Unknown',
    timestamp: new Date()
  }

  // Add random location
  const { lat, lng } = getRandomLatLng() // or getRandomLatLngInNYC()
  newRepost.lat = lat
  newRepost.lng = lng

  await saveRepost(newRepost)
}

async function saveRepost(newRepost) {
  try {
    const repostRef = await addDoc(collection(firestore, 'posts'), newRepost)
    const userRef = doc(firestore, 'users', store.currentUser.uid)

    await updateDoc(userRef, {
      posts: arrayUnion(repostRef.id)
    })

    const followers = store.currentUser.followers || []
    for (const followerId of followers) {
      const followerRef = doc(firestore, 'users', followerId)
      await updateDoc(followerRef, {
        feed: arrayUnion(repostRef.id)
      })
    }

    router.push('/')
  } catch (err) {
    console.error('Failed to repost:', err)
    alert('Repost failed. Try again.')
  }
}
</script>

<style scoped>
.repost-view {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: rgba(189, 240, 245, 0.672);
  border-radius: 8px;
  border: 2px solid #ccc;
}

textarea {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #aaa;
  box-sizing: border-box;
}

button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #43525c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>