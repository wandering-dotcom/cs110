import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebaseResources/auth'

export async function register(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  return await signOut(auth)
}