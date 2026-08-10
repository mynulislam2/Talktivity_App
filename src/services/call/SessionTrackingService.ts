import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionType = 'call' | 'practice' | 'roleplay';

export interface SessionInfo {
  sessionType: SessionType;
  startedAt: string; // ISO
  endedAt?: string; // ISO
}

const STORAGE_KEY = 'active_session';

function nowIso(): string {
  return new Date().toISOString();
}

function parseSession(raw: string | null): SessionInfo | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.sessionType || !parsed?.startedAt) return null;
    return parsed as SessionInfo;
  } catch {
    return null;
  }
}

class SessionTrackingService {
  startSession = async (sessionType: SessionType): Promise<SessionInfo> => {
    const session: SessionInfo = {
      sessionType,
      startedAt: nowIso(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  };

  endSession = async (): Promise<void> => {
    const session = await this.getCurrentSession();
    if (!session) return;
    const ended: SessionInfo = { ...session, endedAt: nowIso() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ended));
  };

  getCurrentSession = async (): Promise<SessionInfo | null> => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseSession(raw);
  };

  isSessionActive = async (): Promise<boolean> => {
    const session = await this.getCurrentSession();
    return Boolean(session && !session.endedAt);
  };
  // ...

  getSessionDuration = async (): Promise<number> => {
    const session = await this.getCurrentSession();
    if (!session?.startedAt) return 0;
    const start = new Date(session.startedAt).getTime();
    const end = session.endedAt
      ? new Date(session.endedAt).getTime()
      : Date.now();
    const seconds = Math.floor((end - start) / 1000);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  };

  cleanup = (): void => {
    // reserved (future timers/listeners)
  };
}

export const sessionTrackingService = new SessionTrackingService();
