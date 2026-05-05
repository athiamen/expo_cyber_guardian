import { initializeApp } from "firebase/app";
import {
    browserLocalPersistence,
    getAuth,
    setPersistence,
} from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ REMPLACER avec votre config Firebase (depuis console.firebase.google.com)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Firebase persistence not available:", err);
});

// Firestore Database
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Multiple tabs open, persistence disabled");
  } else if (err.code === "unimplemented") {
    console.warn("Browser doesn't support IndexedDB");
  }
});

// Storage
export const storage = getStorage(app);

export default app;
