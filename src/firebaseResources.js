import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWoxUNsU8Dsoh7FYWjYSYunAFq5egz40E",
    authDomain: "cs110-d1396.firebaseapp.com",
    projectId: "cs110-d1396",
    storageBucket: "cs110-d1396.firebasestorage.app",
    messagingSenderId: "557441907978",
    appId: "1:557441907978:web:77626e48a7c1a0253a0ef3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
