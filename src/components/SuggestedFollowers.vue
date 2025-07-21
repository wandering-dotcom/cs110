<template>
  <div class="suggested-followers">
    <h2>{{ title || "Who to Follow" }}</h2>
    <ul>
      <li v-if="suggestions.length === 0">No suggestions right now.</li>
      <li v-for="user in suggestions" :key="user.uid">
        <RouterLink :to="`/user/${user.username}`">
            @{{ user.username || user.email }}
        </RouterLink>
        <button
            v-if="canFollow && !isCurrentUser(user)"
            @click="$emit(isFollowing(user) ? 'unfollow' : 'follow', user)"
        >
            {{ isFollowing(user) ? 'Unfollow' : 'Follow' }}
            </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../stores/store.js'
import { RouterLink } from 'vue-router'

const props = defineProps({
  suggestions: Array,
  canFollow: Boolean,
  title: String
})

const currentUser = store.currentUser

function isCurrentUser(user) {
  return currentUser?.uid === user?.uid
}

function isFollowing(user) {
  return currentUser?.following?.includes(user.uid)
}
</script>

<style scoped>
.suggested-followers {
  border: 3px solid #ddd;
  padding: .5rem;
  background: rgba(189, 240, 245, 0.672);
}
button {
  margin-left: 1rem;
  cursor: pointer;
  background-color: #43525c;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 0.5rem;
}
</style>