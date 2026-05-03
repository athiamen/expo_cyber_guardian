import AsyncStorage from "./asyncStorageSafe";

const LEARNING_PROGRESS_KEY_PREFIX = "tx.learning.progress.v2";

type LearningProgressRecord = {
  readCourseCodes: string[];
  completedCourseCodes: string[];
  completedQuizCodes: string[];
};

const EMPTY_PROGRESS: LearningProgressRecord = {
  readCourseCodes: [],
  completedCourseCodes: [],
  completedQuizCodes: [],
};

function getLearningProgressKey(userId?: string) {
  const scope = userId?.trim() ? userId.trim().toLowerCase() : "anonymous";
  return `${LEARNING_PROGRESS_KEY_PREFIX}:${scope}`;
}

async function readLearningProgress(
  userId?: string,
): Promise<LearningProgressRecord> {
  const raw = await AsyncStorage.getItem(getLearningProgressKey(userId));
  if (!raw) {
    return EMPTY_PROGRESS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LearningProgressRecord>;

    return {
      readCourseCodes: Array.isArray(parsed.readCourseCodes)
        ? parsed.readCourseCodes.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
      completedCourseCodes: Array.isArray(parsed.completedCourseCodes)
        ? parsed.completedCourseCodes.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
      completedQuizCodes: Array.isArray(parsed.completedQuizCodes)
        ? parsed.completedQuizCodes.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

async function writeLearningProgressForUser(
  progress: LearningProgressRecord,
  userId?: string,
) {
  await AsyncStorage.setItem(
    getLearningProgressKey(userId),
    JSON.stringify(progress),
  );
}

export async function getLearningProgress(userId?: string) {
  return readLearningProgress(userId);
}

export async function markCourseCompleted(courseCode: string, userId?: string) {
  const progress = await readLearningProgress(userId);
  if (progress.completedCourseCodes.includes(courseCode)) {
    return progress;
  }

  const nextProgress = {
    ...progress,
    completedCourseCodes: [...progress.completedCourseCodes, courseCode],
  };

  await writeLearningProgressForUser(nextProgress, userId);
  return nextProgress;
}

export async function markCourseRead(courseCode: string, userId?: string) {
  const progress = await readLearningProgress(userId);
  if (progress.readCourseCodes.includes(courseCode)) {
    return progress;
  }

  const nextProgress = {
    ...progress,
    readCourseCodes: [...progress.readCourseCodes, courseCode],
  };

  await writeLearningProgressForUser(nextProgress, userId);
  return nextProgress;
}

export async function markQuizCompleted(quizCode: string, userId?: string) {
  const progress = await readLearningProgress(userId);
  if (progress.completedQuizCodes.includes(quizCode)) {
    return progress;
  }

  const nextProgress = {
    ...progress,
    completedQuizCodes: [...progress.completedQuizCodes, quizCode],
  };

  await writeLearningProgressForUser(nextProgress, userId);
  return nextProgress;
}
