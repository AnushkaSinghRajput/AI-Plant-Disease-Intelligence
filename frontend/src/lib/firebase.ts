import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function initFirebase(): { app: FirebaseApp; auth: Auth } | null {
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (_app && _auth) return { app: _app, auth: _auth };
  try {
    if (getApps().length === 0) {
      _app = initializeApp(firebaseConfig);
    } else {
      _app = getApp() as FirebaseApp;
    }
    _auth = getAuth(_app);
    return { app: _app, auth: _auth };
  } catch (e) {
    console.error('Firebase init error:', e);
    return null;
  }
}

/** Use this for sign-in: returns Auth instance after initializing Firebase on the client. */
export function getFirebaseAuth(): Auth | null {
  const out = initFirebase();
  return out ? out.auth : null;
}

export const app = typeof window !== 'undefined' ? (initFirebase()?.app ?? null) : null;
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const storage = typeof window !== 'undefined' && _app ? getStorage(_app) : null;

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}
