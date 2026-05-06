import { QUIZ_CATALOG_BY_ID } from "../features/quiz/data/quizCatalogData";
import { auth } from "./firebase";
import {
    getCoursesByModule,
    getCourseByCode as getFirebaseCourseByCode,
    getModules as getFirebaseModules,
    getProfileMe as getFirebaseProfileMe,
    getQuizByCode as getFirebaseQuizByCode,
    getQuizAttempts,
    getQuizzesByModule,
    markQuizCompleted as markFirebaseQuizCompleted,
    saveQuizAttempt,
    updateProfileMe as updateFirebaseProfileMe,
} from "./firebaseApi";
import {
    getCurrentUser,
    loginWithEmail,
    registerWithEmail,
} from "./firebaseAuth";
import { markQuizCompleted as markLocalQuizCompleted } from "./learningProgress";

const API_BASE_URL = "firebase://firestore";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  organization?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type ModuleItem = {
  id: string;
  code: string;
  title: string;
  level: string;
  progress: number;
  description?: string | null;
  courses: Array<{
    id: string;
    code: string;
    title: string;
    duration: string;
    format: string;
    objective: string;
  }>;
  quizzes: Array<{
    id: string;
    code: string;
    title: string;
    duration: string;
  }>;
};

export type CourseItem = {
  id: string;
  code: string;
  title: string;
  duration: string;
  format: string;
  objective: string;
  module: {
    id: string;
    code: string;
    title: string;
    level: string;
    progress: number;
  };
};

export type QuizItem = {
  id: string;
  code: string;
  title: string;
  duration: string;
  module: {
    id: string;
    code: string;
    title: string;
  };
  questions: Array<{
    id: string;
    code: string;
    prompt: string;
    options: string[];
    correctIdx: number;
  }>;
};

export type QuizSubmitResult = {
  attemptId: string;
  score: number;
  total: number;
  successRate: number;
};

export type ProfileItem = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organization?: string | null;
};

export type ExportReportResult = {
  message: string;
  fileName: string;
  stats: {
    attempts: number;
    averageSuccessRate: number;
  };
  generatedAt: string;
};

function ensureString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function getUidFromToken(token?: string): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Utilisateur non connecte via Firebase");
  }

  if (token) {
    const currentToken = await user.getIdToken();
    if (currentToken !== token) {
      // Keep going with the current Firebase user to avoid hard lock after token refresh.
      console.warn("Session token refreshed by Firebase, using latest token");
    }
  }

  return user.uid;
}

function toAuthSession(params: {
  uid: string;
  email: string | null;
  fullName: string;
  role?: string;
  organization?: string | null;
  token: string;
}): AuthSession {
  return {
    token: params.token,
    user: {
      id: params.uid,
      email: params.email ?? "",
      fullName: params.fullName,
      role: params.role,
      organization: params.organization ?? null,
    },
  };
}

function getQuizQuestionMap(quizCode: string): Map<string, number> {
  const entry = QUIZ_CATALOG_BY_ID[quizCode];
  if (!entry) {
    return new Map<string, number>();
  }

  const pairs: Array<[string, number]> = [];

  ensureArray<{ id: string; correctIndex: number }>(entry.questions).forEach(
    (question) => {
      pairs.push([question.id, question.correctIndex]);
    },
  );

  const difficulties = entry.difficulties;
  if (difficulties) {
    ["easy", "medium", "hard"].forEach((difficulty) => {
      ensureArray<{ id: string; correctIndex: number }>(
        difficulties[difficulty as "easy" | "medium" | "hard"],
      ).forEach((question) => {
        pairs.push([question.id, question.correctIndex]);
      });
    });
  }

  return new Map<string, number>(pairs);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function login(payload: { email: string; password: string }) {
  const authUser = await loginWithEmail(payload.email, payload.password);
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    throw new Error("Connexion Firebase reussie mais session introuvable");
  }

  const token = await firebaseUser.getIdToken();
  return toAuthSession({
    uid: authUser.uid,
    email: authUser.email,
    fullName: authUser.fullName,
    role: "user",
    organization: null,
    token,
  });
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
}) {
  const authUser = await registerWithEmail(
    payload.email,
    payload.password,
    payload.fullName,
  );
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    throw new Error("Inscription Firebase reussie mais session introuvable");
  }

  const token = await firebaseUser.getIdToken();
  return toAuthSession({
    uid: authUser.uid,
    email: authUser.email,
    fullName: authUser.fullName,
    role: "user",
    organization: null,
    token,
  });
}

export async function getModules(): Promise<ModuleItem[]> {
  const modules = await getFirebaseModules();

  const hydrated = await Promise.all(
    modules.map(async (moduleItem: any) => {
      const moduleCode = ensureString(moduleItem.code);
      const [courses, quizzes] = await Promise.all([
        getCoursesByModule(moduleCode),
        getQuizzesByModule(moduleCode),
      ]);

      return {
        id: moduleCode,
        code: moduleCode,
        title: ensureString(moduleItem.title, moduleCode),
        level: ensureString(moduleItem.level, "beginner"),
        progress: ensureNumber(moduleItem.progress, 0),
        description: ensureString(moduleItem.description, ""),
        courses: courses.map((course: any) => ({
          id: ensureString(course.code),
          code: ensureString(course.code),
          title: ensureString(course.title, ensureString(course.code)),
          duration: ensureString(course.duration, "10 min"),
          format: ensureString(course.format, "lecture"),
          objective: ensureString(course.objective, ""),
        })),
        quizzes: quizzes.map((quiz: any) => ({
          id: ensureString(quiz.code),
          code: ensureString(quiz.code),
          title: ensureString(quiz.title, ensureString(quiz.code)),
          duration: ensureString(quiz.duration, "5 min"),
        })),
      };
    }),
  );

  return hydrated;
}

export async function getCourseByCode(courseCode: string): Promise<CourseItem> {
  const course = (await getFirebaseCourseByCode(courseCode)) as any;
  const modules = await getFirebaseModules();
  const moduleCode = ensureString(course.moduleCode);

  const moduleItem = modules.find(
    (item: any) => ensureString(item.code) === moduleCode,
  );

  return {
    id: ensureString(course.code, courseCode),
    code: ensureString(course.code, courseCode),
    title: ensureString(course.title, courseCode),
    duration: ensureString(course.duration, "10 min"),
    format: ensureString(course.format, "lecture"),
    objective: ensureString(course.objective, ""),
    module: {
      id: moduleCode,
      code: moduleCode,
      title: ensureString(moduleItem?.title, moduleCode),
      level: ensureString(moduleItem?.level, "beginner"),
      progress: ensureNumber(moduleItem?.progress, 0),
    },
  };
}

export async function getQuizByCode(quizCode: string): Promise<QuizItem> {
  const quiz = (await getFirebaseQuizByCode(quizCode)) as any;
  const modules = await getFirebaseModules();
  const moduleCode = ensureString(quiz.moduleCode);

  const moduleItem = modules.find(
    (item: any) => ensureString(item.code) === moduleCode,
  );

  const questions = ensureArray<any>(quiz.questions).map((question, index) => ({
    id: ensureString(question.id, `${quizCode}-${index + 1}`),
    code: ensureString(question.code, `${quizCode}-${index + 1}`),
    prompt: ensureString(question.prompt || question.text, ""),
    options: ensureArray<string>(question.options),
    correctIdx: ensureNumber(question.correctIdx ?? question.correctIndex, 0),
  }));

  return {
    id: ensureString(quiz.code, quizCode),
    code: ensureString(quiz.code, quizCode),
    title: ensureString(quiz.title, quizCode),
    duration: ensureString(quiz.duration, "5 min"),
    module: {
      id: moduleCode,
      code: moduleCode,
      title: ensureString(moduleItem?.title, moduleCode),
    },
    questions,
  };
}

export async function submitQuizAnswers(
  quizCode: string,
  answers: Record<string, number>,
  token: string,
): Promise<QuizSubmitResult> {
  const uid = await getUidFromToken(token);
  const answerMap = getQuizQuestionMap(quizCode);

  const total = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
    const correctAnswer = answerMap.get(questionId);
    return acc + (correctAnswer === answer ? 1 : 0);
  }, 0);

  await saveQuizAttempt(uid, quizCode, {
    score,
    totalQuestions: total,
    correctAnswers: score,
  });

  // Mark quiz completed in Firestore and locally
  try {
    await markFirebaseQuizCompleted(uid, quizCode);
  } catch (err) {
    console.warn("Failed to mark quiz completed in Firebase:", err);
  }

  try {
    await markLocalQuizCompleted(quizCode, uid);
  } catch (err) {
    console.warn("Failed to mark quiz completed locally:", err);
  }

  return {
    attemptId: `${quizCode}-${Date.now()}`,
    score,
    total,
    successRate: total > 0 ? Math.round((score / total) * 100) : 0,
  };
}

export async function getProfileMe(token: string): Promise<ProfileItem> {
  const uid = await getUidFromToken(token);
  const profile = (await getFirebaseProfileMe(uid)) as any;

  return {
    id: uid,
    email: ensureString(profile.email, auth.currentUser?.email ?? ""),
    fullName: ensureString(profile.fullName, ""),
    role: ensureString(profile.role, "user"),
    organization: ensureString(profile.organization, ""),
  };
}

export async function updateProfileMe(
  payload: { fullName: string; role: string; organization?: string },
  token: string,
): Promise<ProfileItem> {
  const uid = await getUidFromToken(token);

  await updateFirebaseProfileMe(
    {
      fullName: payload.fullName,
      role: payload.role,
      organization: payload.organization ?? "",
    },
    uid,
  );

  return getProfileMe(token);
}

export async function exportReport(
  payload: { format: "pdf" | "csv"; period: "7d" | "30d" | "90d" },
  token: string,
): Promise<ExportReportResult> {
  const uid = await getUidFromToken(token);
  const attempts = (await getQuizAttempts(uid)) as any[];

  const attemptsCount = attempts.length;
  const rates = attempts
    .map((attempt) => {
      const total = ensureNumber(attempt.totalQuestions, 0);
      const score = ensureNumber(attempt.score, 0);
      if (!total) {
        return 0;
      }
      return (score / total) * 100;
    })
    .filter((value) => Number.isFinite(value));

  const averageSuccessRate = rates.length
    ? Math.round(rates.reduce((acc, value) => acc + value, 0) / rates.length)
    : 0;

  return {
    message: "Rapport genere depuis Firebase",
    fileName: `attempts-${payload.period}.${payload.format}`,
    stats: {
      attempts: attemptsCount,
      averageSuccessRate,
    },
    generatedAt: new Date().toISOString(),
  };
}
