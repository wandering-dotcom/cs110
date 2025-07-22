<template>
  <div class="post">
    <div class="post-header">
      <div class="user-meta">
        <router-link :to="`/user/${post.authorUsername}`">
            @{{ post.authorUsername || 'Unknown' }}
        </router-link><span class="timestamp">on {{ formattedDate }} at {{ formattedTime }}</span>
        </div>
      <div class="menu" @click="showMenu = !showMenu">⋮</div>
      <div v-if="showMenu" class="dropdown" ref="dropdownRef">
        <router-link :to="`/map?user=${post.authorUsername}`">View Heatmap</router-link>
        <router-link :to="`/repost/${post.id}`">Repost & Annotate</router-link></div>
    </div>
    <p>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const showMenu = ref(false)

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

.post-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timestamp {
  font-size: 0.85rem;
}

.menu {
  float: right;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background-color:  rgb(144, 183, 186); 
  border: 2px solid #ffffff;
  border-radius: 8px;
  padding: 0rem;
  z-index: 1000;
  min-width: 180px;
}

.dropdown a {
  display: block;
  padding: 0.5rem;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.dropdown a:hover {
  background-color: #a5e1e8;
}
</style>