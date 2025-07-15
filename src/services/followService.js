import { getDocs, collection, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

export async function followUser(currentUid, targetUid) {
  const userRef = doc(firestore, 'users', currentUid)
  const targetRef = doc(firestore, 'users', targetUid)

  await updateDoc(userRef, { following: arrayUnion(targetUid) })
  await updateDoc(targetRef, { followers: arrayUnion(currentUid) })
}

export async function fetchSuggestedUsers(currentUid, following = []) {
  const snap = await getDocs(collection(firestore, 'users'))
  return snap.docs
    .map(doc => ({ uid: doc.id, ...doc.data() }))
    .filter(u => u.uid !== currentUid && !following.includes(u.uid))
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
}