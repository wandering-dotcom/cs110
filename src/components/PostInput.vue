<template>
  <div class="post-input">
    <h3>Create a new Post</h3>
    <textarea v-model="content" rows="3" placeholder="Brevity is the soul of wit, but we need your post to have text in it."></textarea>
    <button :disabled="content.trim() === ''" @click="submitPost">Post</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['new-post'])

const content = ref('')

function submitPost() {
  const trimmed = content.value.trim()
  if (!trimmed) return
  emit('new-post', trimmed)
  content.value = ''
}
</script>

<style scoped>
.post-input {
    border: 3px solid #ddd;
    background: rgba(189, 240, 245, 0.672);
    margin-bottom: 1rem;
    padding: 0.5rem;
}
textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
button {
  margin-top: 0rem;
  padding: 0.5rem 1rem;
  background-color: #43525c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>