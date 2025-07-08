<template>
  <div class="post-item">
    <strong>{{ post.author }}</strong> 
    <small>{{ formattedDate }}</small>
    <p>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  post: Object
})

const formattedDate = computed(() => {
  return new Date(props.post.timestamp).toLocaleString()
})
</script>

<style scoped>
.post-item {
  border-bottom: 1px solid #ccc;
  padding: 0.5rem 0;
}
small {
  color: #666;
  margin-left: 0.5rem;
}
</style>