<template>
  <div class="user-stats" v-if="user">
    <p><strong>{{ user.username }}</strong></p>
    <p>Posts: {{ postsCount }}</p>
    <p>Following: {{ followingCount }}</p>
    <p>Followers: {{ followersCount }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  user: Object,
  postsCount: Number,
  followingCount: Number,
  followersCount: Number
})
</script>

<style scoped>
.user-stats {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>