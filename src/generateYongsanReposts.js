import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './path-to-your-service-account-key.json' // Replace this with your actual path

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

// Define bounding box for Yongsan-gu
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

// Generate dummy reposts
async function generateReposts(originalPostId, count = 100) {
  const batch = db.batch()
  const postsCollection = db.collection('posts')

  for (let i = 0; i < count; i++) {
    const { lat, lng } = getRandomYongsanLatLng()
    const docRef = postsCollection.doc()

    batch.set(docRef, {
      originalPostId,
      authorUsername: `user${i + 1}`,
      highlightedQuote: `Quote ${i + 1}`,
      repostComment: `Repost comment #${i + 1}`,
      lat,
      lng,
      createdAt: new Date()
    })
  }

  await batch.commit()
  console.log(`${count} dummy reposts created in Yongsan for post: ${originalPostId}`)
}

// Example usage
const originalPostId = 'YOUR_ORIGINAL_POST_ID' // Replace with actual ID
generateReposts(originalPostId, 100)