<template>
  <div class="user-stats">
    <div v-if="user">
        <p><strong>@{{ user.username }}</strong></p>
        <div class="stats-grid">
            <div>Posts</div>
            <div>Following</div>
            <div>Followers</div>
            <div>{{ postsCount }}</div>
            <div>{{ followingCount }}</div>
            <div>{{ followersCount }}</div>
        </div>
    </div>
    <div v-else>
      <RouterLink to="/login">Log In</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { store } from '../stores/store.js'

const props = defineProps({
  user: Object,
  postsCount: Number,
  followingCount: Number,
  followersCount: Number
})

const router = useRouter()
</script>

<style scoped>
.user-stats {
  border: 3px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(189, 240, 245, 0.672);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: left;
  margin: 0rem 0;
  font-size: 0.95rem;
  column-gap: 1rem;
}

.stats-grid > div {
  padding: 1px 0;
}

.stats-grid div:nth-child(-n + 3) {
  font-weight: normal; /* top row: labels */
}

.stats-grid div:nth-child(n + 4) {
  font-weight: normal;   /* bottom row: counts */
}
</style>