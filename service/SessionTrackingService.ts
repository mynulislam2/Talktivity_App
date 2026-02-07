export type SessionType = "call" | "practice" | "roleplay";

export interface SessionInfo {
  sessionType: SessionType;
  startedAt: string; // ISO
  endedAt?: string; // ISO
}

const STORAGE_KEY = "active_session";

function nowIso() {
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
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available');
    }
    const session: SessionInfo = {
      sessionType,
      startedAt: nowIso(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  };

  endSession = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const session = this.getCurrentSession();
    if (!session) return;
    const ended: SessionInfo = { ...session, endedAt: nowIso() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ended));
  };

  getCurrentSession = (): SessionInfo | null => {
    if (typeof window === 'undefined') return null;
    return parseSession(localStorage.getItem(STORAGE_KEY));
  };

  isSessionActive = (): boolean => {
    if (typeof window === 'undefined') return false;
    const session = this.getCurrentSession();
    return Boolean(session && !session.endedAt);
  };

  getSessionDuration = (): number => {
    if (typeof window === 'undefined') return 0;
    const session = this.getCurrentSession();
    if (!session?.startedAt) return 0;
    const start = new Date(session.startedAt).getTime();
    const end = session.endedAt ? new Date(session.endedAt).getTime() : Date.now();
    const seconds = Math.floor((end - start) / 1000);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  };

  cleanup = (): void => {
    // reserved (future timers/listeners)
  };
}

export const sessionTrackingService = new SessionTrackingService();

