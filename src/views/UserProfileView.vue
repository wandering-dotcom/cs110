<template>
  <div v-if="profileUser">
    <div class="user-container">
      <div class="left-panel">
        <UserStats
          :user="profileUser"
          :postsCount="posts.length"
          :followingCount="profileUser.following?.length || 0"
          :followersCount="profileUser.followers?.length || 0"
        />
      </div>

      <div class="center-panel">
        <PostFeed :posts="posts" />
      </div>

      <div class="right-panel">
        <SuggestedFollowers
          :suggestions="[profileUser]"
          :canFollow="false"
          title="Follow this User"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <p>User not found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { query, collection, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources.js'

import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const route = useRoute()
const profileUser = ref(null)
const posts = ref([])

onMounted(async () => {
  const username = route.params.username
  if (!username) return

  // Step 1: Query for user by username
  const usersRef = collection(firestore, 'users')
  const q = query(usersRef, where('username', '==', username))
  const userSnap = await getDocs(q)

  if (userSnap.empty) return

  const userDoc = userSnap.docs[0]
  profileUser.value = { uid: userDoc.id, ...userDoc.data() }

  // Step 2: Load their posts
  const postsRef = collection(firestore, 'posts')
  const qPosts = query(postsRef, where('authorId', '==', profileUser.value.uid))
  const postSnap = await getDocs(qPosts)

  posts.value = postSnap.docs
    .map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate() }))
    .sort((a, b) => b.timestamp - a.timestamp)
})
</script>

<style scoped>
.user-container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
.left-panel, .right-panel {
  flex: 1;
  max-width: 250px;
}
.center-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>