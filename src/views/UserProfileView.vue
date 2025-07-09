<template>
  <div v-if="profileUser">
    <UserStats
      :user="profileUser"
      :postsCount="userPosts.length"
      :followingCount="following.length"
      :followersCount="followers.length"
    />

    <PostFeed :posts="userPosts" />

    <SuggestedFollowers
      :suggestions="[profileUser]"
      :canFollow="false"
      title="User Profile"
    />
  </div>
  <div v-else>
    <p>User not found.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../stores/store.js'
import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const route = useRoute()

const profileUser = computed(() =>
  store.users.find(u => u.username === route.params.username)
)

const userPosts = computed(() =>
  profileUser.value ? store.userPosts[profileUser.value.username] || [] : []
)

const following = computed(() =>
  profileUser.value ? store.following[profileUser.value.username] || [] : []
)

const followers = computed(() =>
  profileUser.value ? store.followers[profileUser.value.username] || [] : []
)
</script>