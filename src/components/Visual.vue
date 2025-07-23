<template>
  <div class="visual" v-if="wordPercentages && totalHighlights > 0">
    <h3>Most Highlighted Words</h3>
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
  postId: String
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
  if (!props.postId) return

  const repostQuery = query(
    collection(firestore, 'posts'),
    where('originalPostId', '==', props.postId)
  )

  const snap = await getDocs(repostQuery)
  const reposts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  wordCounts.value = {}
  totalHighlights.value = 0
  wordComments.value = {}

  reposts.forEach(repost => {
    const quote = repost.highlightedQuote?.trim()
    const comment = repost.repostComment?.trim()
    if (!quote) return

    const words = quote
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // remove punctuation
      .split(/\s+/) // split by whitespace

    words.forEach(word => {
      if (!word) return
      wordCounts.value[word] = (wordCounts.value[word] || 0) + 1
      totalHighlights.value++

      if (comment) {
        if (!wordComments.value[word]) wordComments.value[word] = []
        wordComments.value[word].push({ id: repost.id, comment })
      }
    })
  })
}

function selectWord(word) {
  selectedWord.value = word
}

watch(() => props.postId, () => loadHighlights())
onMounted(() => loadHighlights())
</script>

<style scoped>
.word-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.word {
  cursor: pointer;
  background: #75b9bc;
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
  background: #8dd9dd;
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