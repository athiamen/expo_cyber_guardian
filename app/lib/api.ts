import { Platform } from 'react-native';

const FALLBACK_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://cyber-guardian-app:4000/api';

function normalizeApiBaseUrl(baseUrl: string) {
  if (Platform.OS !== 'android') {
    return baseUrl;
  }

  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === 'cyber-guardian-app') {
      const mappedHost = `10.0.2.2${parsed.port ? `:${parsed.port}` : ''}`;
      return `${parsed.protocol}//${mappedHost}${parsed.pathname}`.replace(/\/$/, '');
    }
  } catch {
    return baseUrl;
  }

  return baseUrl;
}

const RAW_API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_BASE_URL).replace(/\/$/, '');
const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

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

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT';
  token?: string;
  body?: unknown;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: config.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(`Impossible de joindre le backend (${API_BASE_URL}). ${details}`, 0);
  }

  const rawBody = await response.text();
  let data: unknown = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `HTTP ${response.status} (${API_BASE_URL}${path})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function register(payload: { email: string; password: string; fullName: string }) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function getModules() {
  return request<ModuleItem[]>('/modules');
}

export async function getCourseByCode(courseCode: string) {
  return request<CourseItem>(`/courses/${encodeURIComponent(courseCode)}`);
}

export async function getQuizByCode(quizCode: string) {
  return request<QuizItem>(`/quizzes/${encodeURIComponent(quizCode)}`);
}

export async function submitQuizAnswers(
  quizCode: string,
  answers: Record<string, number>,
  token: string
) {
  return request<QuizSubmitResult>(`/quizzes/${encodeURIComponent(quizCode)}/submit`, {
    method: 'POST',
    body: { answers },
    token,
  });
}

export async function getProfileMe(token: string) {
  return request<ProfileItem>('/profile/me', {
    token,
  });
}

export async function updateProfileMe(
  payload: { fullName: string; role: string; organization?: string },
  token: string
) {
  return request<ProfileItem>('/profile/me', {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function exportReport(
  payload: { format: 'pdf' | 'csv'; period: '7d' | '30d' | '90d' },
  token: string
) {
  const params = new URLSearchParams({
    format: payload.format,
    period: payload.period,
  });

  return request<ExportReportResult>(`/reports/export?${params.toString()}`, {
    token,
  });
}
