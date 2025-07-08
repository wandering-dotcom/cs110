<template>
  <div class="post-input">
    <h3>Create a Post</h3>
    <textarea v-model="content" rows="4" placeholder="What's on your mind?"></textarea>
    <button :disabled="content.trim() === ''" @click="submitPost">Post</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['new-post'])

const content = ref('')

function submitPost() {
  if (content.value.trim() === '') return

  emit('new-post', content.value.trim())
  content.value = ''
}
</script>

<style scoped>
.post-input {
  margin-bottom: 2rem;
}
textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>