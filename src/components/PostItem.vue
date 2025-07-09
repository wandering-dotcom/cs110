<template>
  <div class="post">
    <p><strong>@{{ post.author }}</strong>
    <small class="timestamp">
      on {{ formattedDate }} at {{ formattedTime }}
    </small></p>
    <p>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const date = computed(() => new Date(props.post.timestamp))

const formattedDate = computed(() => {
  const d = date.value
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
})

const formattedTime = computed(() => {
  const d = date.value
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`
})
</script>

<style scoped>
.post {
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
}

.timestamp {
  color: #ffffff;
  font-size: 0.85rem;
}
</style>