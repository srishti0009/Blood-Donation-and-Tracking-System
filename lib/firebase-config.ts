// lib/firebase-config.ts
// Firebase Configuration and Initialization

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnnHvZvWexgXA_GdhUOIsO0R1pHN5pqxg",
  authDomain: "bloodlink-dcef0.firebaseapp.com",
  projectId: "bloodlink-dcef0",
  storageBucket: "bloodlink-dcef0.firebasestorage.app",
  messagingSenderId: "329729742439",
  appId: "1:329729742439:web:00b28d0677bfd6bd3866c2",
  measurementId: "G-TWTTEPX7QG"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
export default firebaseConfig;