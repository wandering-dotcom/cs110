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

    <div
      v-if="selectedWord && groupedComments[selectedWord]?.length"
      class="comments-box"
    >
      <h4>Reposts with "{{ selectedWord }}"</h4>
      <ul class="comment-list">
        <li v-for="authorGroup in groupedComments[selectedWord]" :key="authorGroup.username">
          <strong>@{{ authorGroup.username }}</strong>
          <ul class="quote-list">
            <li v-for="entry in authorGroup.entries" :key="entry.id">
              <router-link :to="`/post/${entry.id}`">
                <span class="quote">“{{ entry.quote }}”</span>
              </router-link>
              <span v-if="entry.comment"> — {{ entry.comment }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <button @click="selectedWord = ''" class="close-btn">Close</button>
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
const wordOrder = ref([])
const totalHighlights = ref(0)
const wordComments = ref({})
const selectedWord = ref('')

// Group entries by author for each word
const groupedComments = computed(() => {
  const out = {}
  for (const [word, entries] of Object.entries(wordComments.value)) {
    const byAuthor = {}
    entries.forEach(entry => {
      if (!byAuthor[entry.username]) byAuthor[entry.username] = []
      byAuthor[entry.username].push(entry)
    })
    out[word] = Object.entries(byAuthor).map(([username, entries]) => ({
      username,
      entries
    }))
  }
  return out
})

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
  const lightness = 85 - (pct * 0.5)
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

  const originalPostRef = doc(firestore, 'posts', props.postId)
  const originalSnap = await getDoc(originalPostRef)
  if (!originalSnap.exists()) return

  const originalContent = originalSnap.data().content || ''
  const words = originalContent
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  wordOrder.value = words
  wordCounts.value = {}
  words.forEach(word => {
    if (word) wordCounts.value[word] = 0
  })

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
      if (!(word in wordCounts.value)) return
      wordCounts.value[word]++
      totalHighlights.value++

      if (!wordComments.value[word]) wordComments.value[word] = []
      wordComments.value[word].push({
        id: repost.id,
        username: repost.authorUsername || 'Unknown',
        quote: repost.highlightedQuote || '',
        comment
      })
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

.comments-box {
  background: #f8fbfd;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 700px;
  color: black;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0.75rem;
  max-height: 240px;
  overflow-y: auto;
}

.comment-list > li {
  margin-bottom: 0.5rem;
}

.quote-list {
  list-style: none;
  margin-top: 0.25rem;
  padding-left: 1rem;
}

.quote-list li {
  margin-bottom: 0.25rem;
}

.comment-list a {
  color: #005b8f;
  text-decoration: none;
  font-weight: 500;
}

.comment-list a:hover {
  text-decoration: underline;
}

.quote {
  font-style: italic;
  color: #003348;
}

.close-btn {
  background-color: #7b91a0;
  color: white;
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #62b3be;
}
</style>