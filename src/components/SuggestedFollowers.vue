<template>
  <div class="suggested-followers">
    <h2>Who to Follow</h2>
    <ul>
      <li v-if="suggestions.length === 0">No suggestions right now.</li>
      <li v-for="user in suggestions" :key="user.uid">
        <RouterLink :to="`/user/${user.username}`">
          @{{ user.username || user.email }}
        </RouterLink>
        <button v-if="canFollow" @click="$emit('follow', user)">Follow</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  suggestions: {
    type: Array,
    default: () => []
  },
  canFollow: {
    type: Boolean,
    default: false
  }
})
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