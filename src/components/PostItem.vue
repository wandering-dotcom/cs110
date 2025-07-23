<template>
  <div class="post">
    <p>
      <strong>@{{ post.authorUsername || 'Unknown' }}</strong>
      <small class="timestamp">
        on {{ formattedDate }} at {{ formattedTime }}
      </small>
    </p>
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

const date = computed(() => {
  const ts = props.post.timestamp
  if (!ts) return new Date(NaN)
  return ts.toDate ? ts.toDate() : new Date(ts)
})

const formattedDate = computed(() => {
  const d = date.value
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
})

const formattedTime = computed(() => {
  const d = date.value
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`
})
</script>

<style scoped>
.post {
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
}

.timestamp {
  font-size: 0.85rem;
}
</style>