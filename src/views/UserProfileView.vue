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
            :canFollow="!!currentUser && currentUser.uid !== profileUser.uid"
            @follow="handleFollow"
            @unfollow="handleUnfollow"
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { query, collection, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources.js'
import { fetchUserByUsername } from '../services/userService.js'
import { followUser } from '../services/followService.js'
import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import { unfollowUser } from '../services/followService.js'
import { store } from '../stores/store.js'

const route = useRoute()
const profileUser = ref(null)
const posts = ref([])
const currentUser = store.currentUser

async function loadProfile(username) {
  try {
    profileUser.value = await fetchUserByUsername(username)

    if (!profileUser.value) return

    const uid = profileUser.value.uid
    const postsRef = collection(firestore, 'posts')
    const qPosts = query(postsRef, where('authorId', '==', uid))
    const postSnap = await getDocs(qPosts)

    posts.value = postSnap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        authorUsername: data.author?.trim() || profileUser.value.username || 'Unknown',
        timestamp: data.timestamp?.toDate()
      }
    }).sort((a, b) => b.timestamp - a.timestamp)

  } catch (err) {
    console.error('User profile load failed:', err.message)
    profileUser.value = null
  }
}

async function refreshProfileUser() {
  if (!profileUser.value?.username) return
  profileUser.value = await fetchUserByUsername(profileUser.value.username)
}

async function handleFollow(targetUser) {
  if (!currentUser?.uid || !targetUser?.uid) return

  await followUser(currentUser.uid, targetUser.uid)

  // Ensure currentUser.following is an array
  if (!Array.isArray(currentUser.following)) {
    currentUser.following = []
  }

  if (!currentUser.following.includes(targetUser.uid)) {
    currentUser.following.push(targetUser.uid)
  }

  await refreshProfileUser()
}

async function handleUnfollow(targetUser) {
  if (!currentUser?.uid || !targetUser?.uid) return

  await unfollowUser(currentUser.uid, targetUser.uid)

  if (Array.isArray(currentUser.following)) {
    const index = currentUser.following.indexOf(targetUser.uid)
    if (index !== -1) {
      currentUser.following.splice(index, 1)
    }
  }

  await refreshProfileUser()
}

onMounted(() => {
  if (route.params.username) {
    loadProfile(route.params.username)
  }
})

// WATCH FOR ROUTE CHANGES
watch(() => route.params.username, (newUsername) => {
  if (newUsername) {
    loadProfile(newUsername)
  }
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