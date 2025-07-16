import { firestore } from '../firebaseResources.js'
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

export async function createPost(userId, content, username) {
  const userRef = doc(firestore, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error(`User with ID ${userId} not found`)
  }

  // Use the passed-in username or fallback
  const authorName = username || userSnap.data().username || userSnap.data().displayName || 'Unknown'

  const newPost = {
    timestamp: new Date(),
    authorId: userId,
    author: authorName,
    content
  }

  // Add the post to the "posts" collection
  const postsRef = collection(firestore, 'posts')
  const postDocRef = await addDoc(postsRef, newPost)

  // Add post ID to the user's "posts" array
  await updateDoc(userRef, {
    posts: arrayUnion(postDocRef.id)
  })

  // Add the post to each follower's feed
  const followers = userSnap.data().followers || []

  for (const followerId of followers) {
    const followerRef = doc(firestore, 'users', followerId)
    await updateDoc(followerRef, {
      feed: arrayUnion(postDocRef.id)
    })
  }

  return postDocRef.id
}