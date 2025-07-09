<template>
  <div v-if="profileUser">
    <div class="user-container">
        <div class="left-panel">
            <UserStats
            :user="profileUser"
            :postsCount="userPosts.length"
            :followingCount="following.length"
            :followersCount="followers.length"
            :canLogout="false"
            />
        </div>

        <div class="center-panel">
            <PostFeed :posts="userPosts" />
        </div>

        <div class="right-panel">
            <SuggestedFollowers
            :suggestions="[profileUser]"
            :canFollow="false"
            title="User Profile"
            />
        </div>
    </div>
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
  store.users.find(u => u.id === Number(route.params.userId))
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
  max-width: 250px; /* limit width */
}

.center-panel {
  flex: 2; /* take more space */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>