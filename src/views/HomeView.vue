<template>
  <div class="home-container">
    <div class="left-panel">
      <UserStats
        :user="currentUser"
        :postsCount="userStats.postsCount"
        :followingCount="userStats.followingCount"
        :followersCount="userStats.followersCount"
      />
    </div>
    
    <div class="center-panel">
      <PostFeed :posts="feedPosts" />
      <PostInput v-if="currentUser" @new-post="addPost" />
    </div>
    
    <div class="right-panel">
      <SuggestedFollowers
        :suggestions="suggestedFollowers"
        :canFollow="!!currentUser"
        @follow="handleFollow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, onUnmounted } from 'vue'
import { store } from '../stores/store.js'
import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

import { fetchUserById } from '../services/userService.js'
import { followUser, unfollowUser } from '../services/followService.js'
import { watchFeedPosts } from '../services/feedService.js'
import { fetchFeedPosts } from '../services/feedService.js'
import { createPost } from '../services/postService.js'
import { fetchSuggestedUsers } from '../services/followService.js'
import { firestore } from '../firebaseResources.js'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

// Reactive state
const currentUser = ref(null)
const userStats = ref({ postsCount: 0, followingCount: 0, followersCount: 0 })
const feedPosts = ref([])
const suggestedFollowers = ref([])
let unsubscribeFeed = null

// Load user info and feed
async function loadCurrentUser() {
  const uid = store.currentUser?.uid
  if (!uid) return

  const userData = await fetchUserById(uid)
  currentUser.value = userData

  userStats.value = {
    postsCount: userData.posts?.length || 0,
    followingCount: userData.following?.length || 0,
    followersCount: userData.followers?.length || 0
  }
}

async function loadFeedPosts() {
  if (unsubscribeFeed) {
    unsubscribeFeed()
    unsubscribeFeed = null
  }

  if (!currentUser.value) {
    // No user logged in → fetch global posts once
    const posts = await fetchFeedPosts(null)
    feedPosts.value = posts
  } else {
    const following = currentUser.value.following || []
    const authorIds = following.slice(0, 10)

    unsubscribeFeed = watchFeedPosts(authorIds, (posts) => {
      feedPosts.value = posts
    })
  }
}

async function loadSuggestions() {
  if (currentUser.value) {
    suggestedFollowers.value = await fetchSuggestedUsers(
      currentUser.value.uid,
      currentUser.value.following || []
    )
  } else {
    // No user logged in → show 5 random users without exclusions
    suggestedFollowers.value = await fetchSuggestedUsers()
  }
}

async function refreshUserStats() {
  const uid = currentUser.value?.uid
  if (!uid) return
  const userData = await fetchUserById(uid)
  currentUser.value = userData

  userStats.value = {
    postsCount: userData.posts?.length || 0,
    followingCount: userData.following?.length || 0,
    followersCount: userData.followers?.length || 0
  }
}

async function handleFollow(targetUser) {
  await followUser(currentUser.value.uid, targetUser.uid)

  // Fetch target user's posts
  const snap = await getDoc(doc(firestore, 'users', targetUser.uid))
  const targetPosts = snap.data().posts || []

  // Only update feed if there are posts to add
  if (targetPosts.length > 0) {
    await updateDoc(doc(firestore, 'users', currentUser.value.uid), {
      feed: arrayUnion(...targetPosts)
    })
  }

  // Reload feed
  await refreshUserStats()
  await loadFeedPosts()
}

async function addPost(content) {
  try {
    // Use the username from currentUser (make sure it's loaded)
    const username = currentUser.value.username || 'Unknown'

    // Create post with the service that sets username properly
    const postId = await createPost(currentUser.value.uid, content, username)

    // Update local stats
    userStats.value.postsCount++
    await refreshUserStats()

    // Optionally, you might want to refresh the feed or fetch the new post explicitly here
  } catch (err) {
    console.error('Failed to create post:', err)
    alert('Failed to create post: ' + err.message)
  }
}

onMounted(async () => {
  await loadCurrentUser()
  await loadSuggestions()
  await loadFeedPosts()
})

onUnmounted(() => {
  if (unsubscribeFeed) unsubscribeFeed()
})
</script>

<style scoped>
  .home-container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.left-panel, .right-panel {
  flex: 1;
  max-width: 250px; /* limit width */
}

.center-panel {
  flex: 2; /* take more space */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>