<template>
  <div>
    <UserStats
      :user="currentUser"
      :postsCount="userPosts.length"
      :followingCount="following.length"
      :followersCount="followers.length"
    />
    
    <PostInput v-if="currentUser" @new-post="addPost" />

    <PostFeed :posts="postsToShow" />

    <SuggestedFollowers
      :suggestions="suggestedFollowers"
      :canFollow="!!currentUser"
      @follow="handleFollow"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../stores/store.js'
import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const currentUser = computed(() => store.currentUser)

// Show user’s posts if logged in, else global posts
const postsToShow = computed(() =>
  currentUser.value
    ? store.userPosts[currentUser.value.username] || []
    : store.allPosts
)

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
  // Mock adding post
  const newPost = {
    id: Date.now(),
    author: currentUser.value.username,
    content,
    timestamp: new Date()
  }
  if (!store.userPosts[currentUser.value.username]) {
    store.userPosts[currentUser.value.username] = []
  }
  store.userPosts[currentUser.value.username].unshift(newPost)
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