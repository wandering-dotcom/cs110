<template>
  <div class="user-stats">
    <div v-if="user">
      <p><strong>{{ user.username }}</strong></p>
      <p>Posts: {{ postsCount }}</p>
      <p>Following: {{ followingCount }}</p>
      <p>Followers: {{ followersCount }}</p>
      <button @click="logout">Log Out</button>
    </div>
    <div v-else>
      <RouterLink to="/login">Log In</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { store } from '../stores/store.js'

const props = defineProps({
  user: Object,
  postsCount: Number,
  followingCount: Number,
  followersCount: Number
})

function logout() {
  store.currentUser = null
}
</script>

<style scoped>
.user-stats {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
}

button {
  margin-top: 1rem;
  padding: 0.4rem 0.8rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #c0392b;
}
</style>