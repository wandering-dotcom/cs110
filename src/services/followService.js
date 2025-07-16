import {
  getDocs,
  collection,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { firestore } from '../firebaseResources'

/**
 * Follow a user by updating both user documents.
 *
 * @param {string} currentUid - UID of the user performing the follow.
 * @param {string} targetUid - UID of the user being followed.
 */
export async function followUser(currentUid, targetUid) {
  if (!currentUid || !targetUid || currentUid === targetUid) return

  const currentUserRef = doc(firestore, 'users', currentUid)
  const targetUserRef = doc(firestore, 'users', targetUid)

  try {
    await Promise.all([
      updateDoc(currentUserRef, {
        following: arrayUnion(targetUid)
      }),
      updateDoc(targetUserRef, {
        followers: arrayUnion(currentUid)
      })
    ])
  } catch (err) {
    console.error('Failed to follow user:', err)
    throw err
  }
}

/**
 * Unfollow a user by removing references in both user documents.
 *
 * @param {string} currentUid - UID of the user performing the unfollow.
 * @param {string} targetUid - UID of the user being unfollowed.
 */
export async function unfollowUser(currentUid, targetUid) {
  if (!currentUid || !targetUid || currentUid === targetUid) return

  const currentUserRef = doc(firestore, 'users', currentUid)
  const targetUserRef = doc(firestore, 'users', targetUid)

  try {
    await Promise.all([
      updateDoc(currentUserRef, {
        following: arrayRemove(targetUid)
      }),
      updateDoc(targetUserRef, {
        followers: arrayRemove(currentUid)
      })
    ])
  } catch (err) {
    console.error('Failed to unfollow user:', err)
    throw err
  }
}

/**
 * Fetch a list of suggested users to follow.
 * - If `currentUid` is provided, it excludes that user and people they follow.
 * - Otherwise, returns 5 random users.
 *
 * @param {string|null} currentUid
 * @param {string[]} [currentlyFollowing=[]]
 * @returns {Promise<Array>} Suggested users
 */
export async function fetchSuggestedUsers(currentUid = null, currentlyFollowing = []) {
  const snapshot = await getDocs(collection(firestore, 'users'))
  const allUsers = snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }))

  let suggestions = allUsers

  if (currentUid) {
    suggestions = allUsers.filter(
      user => user.uid !== currentUid && !currentlyFollowing.includes(user.uid)
    )
  }

  // Shuffle and return top 5
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 5)
}