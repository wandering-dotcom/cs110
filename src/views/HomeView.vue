<template>
  <div class="home-container">
    <div class="left-panel">
      <UserStats
        :user="currentUser"
        :postsCount="userPosts.length"
        :followingCount="following.length"
        :followersCount="followers.length"
      />
      <Logout :user="currentUser"/>
    </div>
    
    <div class="center-panel">
      <PostFeed :posts="postsToShow" />
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
import { computed } from 'vue'
import { store } from '../stores/store.js'
import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import Logout from '../components/Logout.vue'

const currentUser = computed(() => store.currentUser)

// Show user’s posts if logged in, else global posts
const userPostsForCurrentUser = computed(() => {
  if (!currentUser.value) return []
  return store.userPosts[currentUser.value.username] || []
})

const postsToShow = computed(() => {
  return currentUser.value ? store.allPosts : store.allPosts
})

// For stats
const userPosts = computed(() =>
  currentUser.value ? store.userPosts[currentUser.value.username] || [] : []
)
const following = computed(() =>
  currentUser.value ? store.following[currentUser.value.username] || [] : []
)
const followers = computed(() =>
  currentUser.value ? store.followers[currentUser.value.username] || [] : []
)

// Suggested followers - users not followed yet, or 5 random users if logged out
const suggestedFollowers = computed(() => {
  if (!currentUser.value) {
    return store.users.slice(0, 5)
  }
  // filter users not in following list and not currentUser
  return store.users.filter(
    u =>
      u.username !== currentUser.value.username &&
      !following.value.includes(u.username)
  ).slice(0, 5)
})

function addPost(content) {
  const username = store.currentUser.username;
  const newPost = {
    id: Date.now(),
    author: username,
    content,
    timestamp: new Date()
  };

  // Add to allPosts reactively
  store.allPosts = [newPost, ...store.allPosts];

  // Add to user's own posts
  if (!store.userPosts[username]) {
    store.userPosts[username] = [];
  }
  store.userPosts[username].unshift(newPost);
}

function handleFollow(user) {
  // Add to following and followers lists mock
  if (!store.following[currentUser.value.username]) {
    store.following[currentUser.value.username] = []
  }
  if (!store.followers[user.username]) {
    store.followers[user.username] = []
  }
  if (!store.following[currentUser.value.username].includes(user.username)) {
    store.following[currentUser.value.username].push(user.username)
  }
  if (!store.followers[user.username].includes(currentUser.value.username)) {
    store.followers[user.username].push(currentUser.value.username)
  }
}
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