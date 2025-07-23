<template>
  <div class="visual" v-if="user">
    <h3>Most Highlighted Words by {{ user }}</h3>
    <div class="word-cloud">
      <span
        v-for="(pct, word) in wordPercentages"
        :key="word"
        :class="'word ' + getSizeClass(pct)"
        @click="selectWord(word)"
      >
        {{ word }}
        <small class="pct">{{ pct }}%</small>
      </span>
    </div>

    <div v-if="selectedWord" class="comments">
      <h4>Comments for "{{ selectedWord }}"</h4>
      <ul>
        <li v-for="comment in wordComments[selectedWord]" :key="comment.id">
          {{ comment.comment }}
        </li>
      </ul>
      <button @click="selectedWord = ''">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources.js'

const props = defineProps({
  user: String,
})

const wordCounts = ref({})
const totalHighlights = ref(0)
const wordComments = ref({})
const selectedWord = ref('')

function getSizeClass(pct) {
  if (pct > 50) return 'large'
  if (pct > 25) return 'medium'
  return 'small'
}

const wordPercentages = computed(() => {
  const out = {}
  Object.entries(wordCounts.value).forEach(([word, count]) => {
    out[word] = Math.round((count / totalHighlights.value) * 100)
  })
  return out
})

async function loadHighlights() {
  if (!props.user) return

  // Query posts by user
  const postsQ = query(collection(firestore, 'posts'), where('authorUsername', '==', props.user))
  const postsSnap = await getDocs(postsQ)
  const postIds = postsSnap.docs.map(d => d.id)

  if (postIds.length === 0) return

  // Query reposts with originalPostId in postIds (batch in chunks if needed)
  const reposts = []
  const batchQueries = []
  const chunkSize = 10

  for (let i = 0; i < postIds.length; i += chunkSize) {
    const chunk = postIds.slice(i, i + chunkSize)
    batchQueries.push(query(collection(firestore, 'posts'), where('originalPostId', 'in', chunk)))
  }

  for (const q of batchQueries) {
    const snap = await getDocs(q)
    reposts.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  // Process reposts data
  wordCounts.value = {}
  totalHighlights.value = 0
  wordComments.value = {}

  reposts.forEach(repost => {
    const quote = repost.highlightedQuote?.trim()
    const comment = repost.repostComment?.trim()
    if (!quote) return

    const word = quote.split(' ')[0].toLowerCase()
    wordCounts.value[word] = (wordCounts.value[word] || 0) + 1
    totalHighlights.value++

    if (comment) {
      if (!wordComments.value[word]) wordComments.value[word] = []
      wordComments.value[word].push({ id: repost.id, comment })
    }
  })
}

function selectWord(word) {
  selectedWord.value = word
}

watch(() => props.user, () => {
  loadHighlights()
})

onMounted(() => {
  loadHighlights()
})
</script>

<style scoped>
.word-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.word {
  position: relative;
  cursor: pointer;
  background: #d5f6f8;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.word:hover {
  background-color: #a5e1e8;
}

.pct {
  font-size: 0.75rem;
  font-weight: bold;
  color: #004a6e;
}

.small {
  font-size: 1rem;
}

.medium {
  font-size: 1.5rem;
}

.large {
  font-size: 2rem;
}

.comments {
  background: #eef;
  padding: 1rem;
  border-radius: 8px;
  max-width: 600px;
  margin-top: 1rem;
}

.comments ul {
  list-style: disc inside;
  max-height: 150px;
  overflow-y: auto;
}
</style>