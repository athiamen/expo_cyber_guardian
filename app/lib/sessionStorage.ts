import AsyncStorage from './asyncStorageSafe';
import { AuthSession } from './api';

const SESSION_KEY = 'tx.auth.session.v1';

export async function saveSession(session: AuthSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (typeof parsed?.token !== 'string' || typeof parsed?.user?.id !== 'string') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
