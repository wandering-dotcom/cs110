import { doc, getDoc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

export async function loadFeedPosts(userIds) {
  const postQuery = query(
    collection(firestore, 'posts'),
    where('authorId', 'in', userIds.slice(0, 10))
  )
  const snap = await getDocs(postQuery)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export function watchFeedPosts(userIds, callback) {
  const postQuery = query(
    collection(firestore, 'posts'),
    where('authorId', 'in', userIds.slice(0, 10))
  )
  return onSnapshot(postQuery, snapshot => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(posts.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds))
  })
}