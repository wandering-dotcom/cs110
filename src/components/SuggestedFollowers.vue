<template>
  <div class="suggested-followers">
    <h2>{{ title }}</h2>
    <div v-if="suggestions.length === 0">
      <p>No one to follow right now.</p>
    </div>
    <ul>
      <li v-for="user in suggestions" :key="user.id">
        <RouterLink :to="`/profile/${user.id}`">@{{ user.username }}</RouterLink>
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
    default: 'Who to Follow'
  }
})

const emit = defineEmits(['follow'])

function followUser(user) {
  emit('follow', user)
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
  cursor: pointer;
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