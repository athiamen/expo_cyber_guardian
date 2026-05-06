import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Firebase env variable: ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: getRequiredEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

if (Platform.OS === "web") {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Firebase web persistence not available:", err);
  });
}

// Firestore Database
export const db = getFirestore(app);
if (Platform.OS === "web") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence disabled");
    } else if (err.code === "unimplemented") {
      console.warn("Browser doesn't support IndexedDB");
    }
  });
}

// Storage
export const storage = getStorage(app);

export default app;
