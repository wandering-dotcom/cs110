import { firestore } from '../firebaseResources.js'
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

export async function createPost(userId, content) {
    const postsRef = collection(firestore, 'posts')

    const newPost = {
        timestamp: new Date(),
        author: userId,
        content
    }
    
    const postDocRef = await addDoc(postsRef, newPost)

    // Update user's posts
    const userRef = doc(firestore, 'users', userId)
    await updateDoc(userRef, {
        posts: arrayUnion(postDocRef.id)
    })

    // Add to followers' feeds
    const userSnap = await getDoc(userRef)
    const followers = userSnap.data().followers || []

    for (const followerId of followers) {
        const followerRef = doc(firestore, 'users', followerId)
        await updateDoc(followerRef, {
        feed: arrayUnion(postDocRef.id)
        })
    }

    return postDocRef.id
}