<template>
  <div class="post">
    <div class="post-header" ref="dropdownRef">
      <div class="user-meta">
        <router-link :to="`/user/${post.authorUsername}`">
          @{{ post.authorUsername || 'Unknown' }}
        </router-link>
        <span class="timestamp">on {{ formattedDate }} at {{ formattedTime }}</span>
      </div>
      <div class="menu" @click.stop="toggleMenu">⋮</div>
      <div v-if="showMenu" class="dropdown" @click.stop>
        <a href="#" class="dropdown-option" @click.prevent="goToHeatmap">View Heatmap</a>
        <router-link :to="`/repost/${post.id}`">Repost & Annotate</router-link>
    </div>
    </div>
    <p>{{ post.content }}</p>
    <!-- If this post is a repost, link to original -->
    <div v-if="post.originalPostId || post.originalPostContent" class="original-link">
        <router-link :to="`/post/${post.originalPostId}`">View Original Post</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'

const router = useRouter()
const showMenu = ref(false)
const dropdownRef = ref(null)

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

function goToHeatmap() {
  if (!props.post.id) {
    alert('No post ID provided')
    return
  }
  router.push({ name: 'MapView', params: { postId: props.post.id } }).then(() => {
    nextTick(() => {
      showMenu.value = false
    })
  })
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

// Handler to close dropdown if clicked outside
function onClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

// Date formatting logic same as before
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
  position: relative; /* for absolute dropdown positioning */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timestamp {
  font-size: 0.85rem;
}

.menu {
  cursor: pointer;
  user-select: none;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background-color: rgb(144, 183, 186);
  border: 2px solid #ffffff;
  border-radius: 8px;
  padding: 0;
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

.dropdown-option {
  padding: 0.5rem;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.dropdown-option:hover {
  background-color: #a5e1e8;
}

.post p {
  white-space: pre-line;
}

.original-link {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #2b4c5b;
}

.original-link a {
  text-decoration: underline;
  color: #2b4c5b;
}

.original-link a:hover {
  color: #0b2531;
}
</style>