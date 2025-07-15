import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

export async function fetchUserById(uid) {
  const userDocRef = doc(firestore, 'users', uid)
  const userSnap = await getDoc(userDocRef)
  if (!userSnap.exists()) throw new Error('User not found')
  return { uid, ...userSnap.data() }
}