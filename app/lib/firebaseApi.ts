import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

// ========== MODULES ==========
export async function getModules() {
  try {
    const modulesRef = collection(db, "modules");
    const snapshot = await getDocs(modulesRef);
    return snapshot.docs.map((doc) => ({
      code: doc.id,
      ...doc.data(),
    })) as any[];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch modules");
  }
}

// ========== COURSES ==========
export async function getCourseByCode(courseCode: string) {
  try {
    const courseRef = doc(db, "courses", courseCode);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      throw new Error(`Course ${courseCode} not found`);
    }
    return {
      code: courseSnap.id,
      ...courseSnap.data(),
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch course");
  }
}

export async function getCoursesByModule(moduleCode: string) {
  try {
    const q = query(
      collection(db, "courses"),
      where("moduleCode", "==", moduleCode),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      code: doc.id,
      ...doc.data(),
    })) as any[];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch courses");
  }
}

// ========== QUIZZES ==========
export async function getQuizzesByModule(moduleCode: string) {
  try {
    const q = query(
      collection(db, "quizzes"),
      where("moduleCode", "==", moduleCode),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      code: doc.id,
      ...doc.data(),
    })) as any[];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch quizzes");
  }
}

export async function getQuizByCode(quizCode: string) {
  try {
    const quizRef = doc(db, "quizzes", quizCode);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) {
      throw new Error(`Quiz ${quizCode} not found`);
    }
    return {
      code: quizSnap.id,
      ...quizSnap.data(),
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch quiz");
  }
}

// ========== USER PROFILE ==========
export async function getProfileMe(uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }
    return userSnap.data();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch profile");
  }
}

export async function updateProfileMe(updates: any, uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updates);
  } catch (error: any) {
    throw new Error(error.message || "Failed to update profile");
  }
}

// ========== PROGRESS TRACKING ==========
export async function saveQuizAttempt(
  uid: string,
  quizCode: string,
  result: any,
) {
  try {
    const attemptRef = doc(
      collection(db, "users", uid, "quizAttempts"),
      `${quizCode}-${Date.now()}`,
    );
    await setDoc(attemptRef, {
      quizCode,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      attemptedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error(error.message || "Failed to save quiz attempt");
  }
}

export async function getQuizAttempts(uid: string) {
  try {
    const attemptsRef = collection(db, "users", uid, "quizAttempts");
    const snapshot = await getDocs(attemptsRef);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch quiz attempts");
  }
}

// ========== LEARNING PROGRESS ==========
export async function markCourseRead(uid: string, courseCode: string) {
  try {
    const progressRef = doc(db, "users", uid, "progress", "courses");
    const progressSnap = await getDoc(progressRef);
    const currentProgress = progressSnap.data() || {};

    await setDoc(progressRef, {
      ...currentProgress,
      [courseCode]: { status: "read", readAt: Timestamp.now() },
    });
  } catch (error: any) {
    console.warn("Failed to mark course as read:", error);
  }
}

export async function markCourseCompleted(uid: string, courseCode: string) {
  try {
    const progressRef = doc(db, "users", uid, "progress", "courses");
    const progressSnap = await getDoc(progressRef);
    const currentProgress = progressSnap.data() || {};

    await setDoc(progressRef, {
      ...currentProgress,
      [courseCode]: { status: "completed", completedAt: Timestamp.now() },
    });
  } catch (error: any) {
    console.warn("Failed to mark course as completed:", error);
  }
}

export async function getLearningProgress(uid: string) {
  try {
    const progressRef = doc(db, "users", uid, "progress", "courses");
    const progressSnap = await getDoc(progressRef);
    const coursesProgress = progressSnap.data() || {};

    const completedCourseCodes = Object.entries(coursesProgress)
      .filter(([_, data]: any) => data.status === "completed")
      .map(([code]) => code);

    return {
      completedCourseCodes,
      completedQuizCodes: [], // À implémenter
    };
  } catch (error: any) {
    return { completedCourseCodes: [], completedQuizCodes: [] };
  }
}

// ========== UTILITY ==========
export function getApiBaseUrl(): string {
  return "Firebase Firestore";
}
