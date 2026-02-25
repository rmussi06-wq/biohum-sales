import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Configure via .env (Vite):
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...

let db = null

export function initFirebase() {
  if (getApps().length) return { db }

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  // Minimal guard
  if (!config.apiKey || !config.projectId) {
    console.warn("Firebase não configurado. Preencha o arquivo .env com as chaves do Firebase.")
  }

  const app = initializeApp(config)
  db = getFirestore(app)
  return { db }
}

export function getDb() {
  return db
}