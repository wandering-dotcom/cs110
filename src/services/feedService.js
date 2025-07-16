import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot, 
  orderBy,
  limit
} from 'firebase/firestore'
import { firestore } from '../firebaseResources'

/**
 * Sets up a real-time listener for posts by a list of user IDs.
 *
 * @param {string[]} authorIds - Array of author UIDs (max 10).
 * @param {(posts: any[]) => void} callback - Called with a sorted list of posts.
 * @returns {() => void} Unsubscribe function to stop listening.
 */
export function watchFeedPosts(authorIds, callback) {
  if (!authorIds?.length) {
    callback([])
    return () => {}
  }

  const sliced = authorIds.slice(0, 10) // Firestore "in" query limit
  const postsQuery = query(
    collection(firestore, 'posts'),
    where('authorId', 'in', sliced),
    orderBy('timestamp', 'desc')
  )

  const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
    const posts = snapshot.docs.map(docSnap => {
      const data = docSnap.data()

      return {
        id: docSnap.id,
        content: data.content,
        authorId: data.authorId,
        authorUsername: data.author?.trim() || 'Unknown',
        timestamp: data.timestamp?.toDate() || new Date()
      }
    })

    // Already ordered by timestamp desc in Firestore
    callback(posts)
  })

  return unsubscribe
}

export async function fetchFeedPosts(uid = null) {
  if (!uid) {
    // No user logged in → return 10 most recent global posts
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(postsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      authorUsername: doc.data().author?.trim() || 'Unknown',
      timestamp: doc.data().timestamp?.toDate()
    }))
  }

  // Logged-in user: fetch users they are following
  const userDoc = await getDoc(doc(firestore, 'users', uid))
  if (!userDoc.exists()) return []

  const following = userDoc.data().following || []

  if (following.length === 0) return []

  const sliced = following.slice(0, 10)

  const postsQuery = query(
    collection(firestore, 'posts'),
    where('authorId', 'in', sliced),
    orderBy('timestamp', 'desc'),
    limit(10)
  )

  const snapshot = await getDocs(postsQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    authorUsername: doc.data().author?.trim() || 'Unknown',
    timestamp: doc.data().timestamp?.toDate()
  }))
}