import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(readFileSync(new URL('./firebase-admin-key.json', import.meta.url)))

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

const getRandomYongsanLatLng = () => {
  const minLat = 37.525
  const maxLat = 37.555
  const minLng = 126.960
  const maxLng = 126.995
  return {
    lat: Math.random() * (maxLat - minLat) + minLat,
    lng: Math.random() * (maxLng - minLng) + minLng
  }
}

async function generateReposts(originalPostId, count = 3000) {
  const postsCollection = db.collection('posts')
  const originalPostDoc = await postsCollection.doc(originalPostId).get()
  if (!originalPostDoc.exists) {
    console.error('Original post not found:', originalPostId)
    return
  }
  const originalData = originalPostDoc.data()
  console.log('Original post data:', originalData) // Debug to check field names

  const originalContent = originalData.content || ''
  const words = originalContent.split(/\s+/).filter(Boolean)

  const batch = db.batch()

  const MIN_SNIPPET_WORDS = 3
  const MAX_SNIPPET_WORDS = 7

  for (let i = 0; i < count; i++) {
    const { lat, lng } = getRandomYongsanLatLng()
    const docRef = postsCollection.doc()

    let quote = ''

    if (words.length > MIN_SNIPPET_WORDS) {
      // snippet length capped at max words or max snippet size
      const maxSnippetLength = Math.min(MAX_SNIPPET_WORDS, words.length)
      const snippetLength = MIN_SNIPPET_WORDS + Math.floor(Math.random() * (maxSnippetLength - MIN_SNIPPET_WORDS + 1))
      const maxStartIndex = words.length - snippetLength
      const start = Math.floor(Math.random() * (maxStartIndex + 1))
      quote = words.slice(start, start + snippetLength).join(' ')
    } else if (words.length > 0) {
      // For short posts with 1 or 2 words, pick random snippet length 1 to words.length
      const snippetLength = 1 + Math.floor(Math.random() * words.length)
      const maxStartIndex = words.length - snippetLength
      const start = Math.floor(Math.random() * (maxStartIndex + 1))
      quote = words.slice(start, start + snippetLength).join(' ')
    } else {
      // No words in original content, use generic quote
      quote = `Quote ${i + 1}`
    }

    batch.set(docRef, {
      originalPostId,
      authorUsername: `user${i + 1}`,
      highlightedQuote: quote,
      repostComment: `Repost comment #${i + 1}`,
      lat,
      lng,
      createdAt: new Date()
    })
  }

  await batch.commit()
  console.log(`${count} dummy reposts created in Yongsan for post: ${originalPostId}`)
}

async function deleteReposts(originalPostId) {
  const postsCollection = db.collection('posts')
  const querySnapshot = await postsCollection.where('originalPostId', '==', originalPostId).get()

  if (querySnapshot.empty) {
    console.log('No reposts found to delete.')
    return
  }

  const batch = db.batch()
  querySnapshot.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  console.log(`Deleted ${querySnapshot.size} reposts for original post: ${originalPostId}`)
}

// Replace this with your actual post ID
const originalPostId = '86ozfBYuG59cIZMGTlph'

// Example usage:
// generateReposts(originalPostId, 100)
// deleteReposts(originalPostId)

// Uncomment one to run:
generateReposts(originalPostId, 3000)
// deleteReposts(originalPostId)
