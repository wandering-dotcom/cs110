import { auth, firestore } from '../firebaseResources.js'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import {
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore'

async function createUserDocIfNotExists(user) {
  const userRef = doc(firestore, 'users', user.uid)
  const docSnap = await getDoc(userRef)

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      username: user.email.split('@')[0], 
      feed: [],
      followers: [],
      following: [],
      posts: []
    })
  }
}

export async function register(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function logout() {
  await signOut(auth)
}