import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  fullName: string;
};

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    // Créer profil utilisateur dans Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      fullName,
      role: "user",
      organization: "",
      createdAt: new Date().toISOString(),
    });

    return { uid, email, fullName };
  } catch (error: any) {
    throw new Error(error.message || "Registration failed");
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    // Récupérer profil depuis Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.data();

    return {
      uid,
      email: userCredential.user.email,
      fullName: userData?.fullName || "",
    };
  } catch (error: any) {
    throw new Error(error.message || "Login failed");
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Logout failed");
  }
}

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Récupérer profil complet depuis Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: userData?.fullName || "",
      });
    } else {
      callback(null);
    }
  });
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.data();
}
