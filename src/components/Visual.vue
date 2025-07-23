<template>
  <div class="visual" v-if="orderedWords.length > 0">
    <h3>Most Highlighted Words</h3>
    <div class="word-cloud">
      <span
        v-for="word in orderedWords"
        :key="word"
        class="word"
        :style="getWordStyle(word)"
        @click="selectWord(word)"
      >
        {{ word }}
        <small class="pct">{{ wordPercentages[word] }}%</small>
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
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources.js'

const props = defineProps({
  postId: String
})

const wordCounts = ref({})
const wordOrder = ref([]) // preserves original order
const totalHighlights = ref(0)
const wordComments = ref({})
const selectedWord = ref('')

const wordPercentages = computed(() => {
  const out = {}
  Object.entries(wordCounts.value).forEach(([word, count]) => {
    out[word] = Math.round((count / totalHighlights.value) * 100)
  })
  return out
})

const orderedWords = computed(() => {
  return wordOrder.value.filter(word => word in wordCounts.value)
})

function getWordStyle(word) {
  const pct = wordPercentages.value[word] || 0

  const hue = 190
  const saturation = 70
  const lightness = 85 - (pct * 0.5) // Range from 85% (light) to 60% (dark)

  // Determine text color based on lightness
  const textColor = lightness < 70 ? '#fff' : '#002b36'

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: textColor,
    fontWeight: '600',
    fontSize: `${1 + pct / 50}rem`,
  }
}

function selectWord(word) {
  selectedWord.value = word
}

async function loadHighlights() {
  if (!props.postId) return

  // Load original post first
  const originalPostRef = doc(firestore, 'posts', props.postId)
  const originalSnap = await getDoc(originalPostRef)
  if (!originalSnap.exists()) return

  const originalContent = originalSnap.data().content || ''
  const words = originalContent
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  // Set word order and initialize counts
  wordOrder.value = words
  wordCounts.value = {}
  words.forEach(word => {
    if (word) wordCounts.value[word] = 0
  })

  // Load reposts
  const repostQuery = query(
    collection(firestore, 'posts'),
    where('originalPostId', '==', props.postId)
  )
  const snap = await getDocs(repostQuery)
  const reposts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  totalHighlights.value = 0
  wordComments.value = {}

  reposts.forEach(repost => {
    const quote = repost.highlightedQuote?.trim()
    const comment = repost.repostComment?.trim()
    if (!quote) return

    const quotedWords = quote
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)

    quotedWords.forEach(word => {
      if (!word) return
      if (!(word in wordCounts.value)) return // skip if not in original post
      wordCounts.value[word]++
      totalHighlights.value++

      if (comment) {
        if (!wordComments.value[word]) wordComments.value[word] = []
        wordComments.value[word].push({ id: repost.id, comment })
      }
    })
  })
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
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color 0.3s, font-size 0.3s, color 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.word:hover {
  outline: 1px solid #007b8f;
}

.pct {
  font-size: 0.75rem;
  font-weight: bold;
  color: #004a6e;
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