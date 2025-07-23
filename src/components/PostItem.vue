<template>
  <div class="post">
    <div class="post-header" ref="dropdownRef">
      <div class="user-meta">
        <router-link :to="`/user/${post.authorUsername}`">@{{ post.authorUsername || 'Unknown' }}</router-link>
        <span class="timestamp"> on {{ formattedDate }} at {{ formattedTime }}</span>
      </div>

      <!-- 🔒 Show menu only if NOT a repost -->
      <template v-if="!post.isRepost">
        <div class="menu" @click.stop="toggleMenu">⋮</div>
        <div v-if="showMenu" class="dropdown" @click.stop>
          <a href="#" class="dropdown-option" @click.prevent="goToHeatmap">View Heatmap</a>
          <router-link
            v-if="isLoggedIn"
            :to="`/repost/${post.id}`"
            class="dropdown-option"
          >
            Repost & Annotate
          </router-link>
        </div>
      </template>
    </div>

    <!-- Repost format -->
    <div v-if="post.isRepost" class="repost-box">
      <blockquote class="original-content">
        <span class="quote-text">“{{ post.originalPostContent || 'Original content not found.' }}”</span>
        <footer v-if="post.originalPostAuthorUsername">
          — <router-link :to="`/user/${post.originalPostAuthorUsername}`" class="profile-link">
            @{{ post.originalPostAuthorUsername }}
          </router-link>
        </footer>
      </blockquote>
      <p v-if="post.repostComment" class="repost-comment">{{ post.repostComment }}</p>
      <div v-if="post.originalPostId" class="original-link">
        <router-link :to="`/post/${post.originalPostId}`">View Original Post</router-link>
      </div>
    </div>

    <!-- Regular post -->
    <p v-else>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../stores/store.js' // ✅ Import store

const router = useRouter()
const showMenu = ref(false)
const dropdownRef = ref(null)

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// ✅ Check if user is logged in
const isLoggedIn = computed(() => !!store.currentUser)

function goToHeatmap() {
  if (!props.post.id) return
  router.push({ name: 'MapView', params: { postId: props.post.id } }).then(() => {
    nextTick(() => (showMenu.value = false))
  })
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

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

const date = computed(() => {
  const ts = props.post.timestamp
  return ts?.toDate ? ts.toDate() : new Date(ts)
})

const formattedDate = computed(() => {
  const d = date.value
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
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
  margin-left: 0rem;
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

.repost-box {
  background: #f4f8fa;
  border-left: 4px solid #62b3be;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.original-content {
  margin: 0;
  padding-left: 0.5rem;
  font-style: italic;
  color: #333;
}

.quote-text {
  display: block;
  font-size: 1.1rem;
}

.repost-comment {
  margin-top: 0.75rem;
  font-weight: normal;
  color: black;
}

a.profile-link {
  color: #0077cc; /* blue or your preferred color */
  text-decoration: none;
  font-weight: 500;
}

a.profile-link:hover {
  color: #004c99; /* darker shade on hover */
  text-decoration: underline;
}
</style>