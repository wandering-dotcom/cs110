import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

export async function fetchUserById(uid) {
  const userDocRef = doc(firestore, 'users', uid)
  const userSnap = await getDoc(userDocRef)
  if (!userSnap.exists()) throw new Error('User not found')
  return { uid, ...userSnap.data() }
}

export async function fetchUserByUsername(username) {
  const q = query(collection(firestore, 'users'), where('username', '==', username))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('User not found')
  const docSnap = snap.docs[0]
  return { uid: docSnap.id, ...docSnap.data() }
}