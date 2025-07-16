import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot
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
    where('authorId', 'in', sliced)
  )

  const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
    const posts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const userRef = doc(firestore, 'users', data.authorId)
        const userSnap = await getDoc(userRef)
        const username = userSnap.exists() ? userSnap.data().username : 'Unknown'

        return {
          id: docSnap.id,
          content: data.content,
          authorId: data.authorId,
          authorUsername: username,
          timestamp: data.timestamp?.toDate() || new Date()
        }
      })
    )

    // Sort posts by timestamp (newest first)
    posts.sort((a, b) => b.timestamp - a.timestamp)

    callback(posts)
  })

  return unsubscribe
}