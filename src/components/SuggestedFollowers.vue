<template>
  <div>
    <h2>{{ title }}</h2>
    <div v-if="suggestions.length === 0">
      <p>No one to follow right now.</p>
    </div>
    <ul>
      <li v-for="user in suggestions" :key="user.id">
        <RouterLink :to="`/users/${user.id}`">{{ user.username }}</RouterLink>
        <button v-if="canFollow" @click="followUser(user)">Follow</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  suggestions: {
    type: Array,
    default: () => []
  },
  canFollow: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Suggested Followers'
  }
})

const emit = defineEmits(['follow'])

function followUser(user) {
  emit('follow', user)
}
</script>

<style scoped>
button {
  margin-left: 1rem;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 0.5rem;
}
</style>