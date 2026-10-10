/**
 * Session consistency between the two places the app records "I am logged in".
 *
 * The app records that fact twice:
 *   - AsyncStorage keys `token` / `user` — what httpservice attaches to every
 *     request, and what authService.getUser() reads
 *   - the redux `auth` slice, which is in the redux-persist whitelist and so
 *     survives a restart
 *
 * Nothing kept the two in step, so they could disagree permanently: a forced
 * logout drops the token while the persisted `isAuthenticated: true` lives on.
 * RootNavigator gates only on that flag, so the app reopens straight into Main
 * with no credentials, every screen shows the backend's "No token provided",
 * the call screen throws "User not authenticated", and the header still greets
 * the user by their persisted name.
 *
 * These tests pin both directions that divergence can happen.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

// The shared jest.setup mock stores nothing and has no multiRemove. These
// tests are about what actually ends up in storage, so give it a real one.
// The map is created inside the factory: `@/store` calls persistStore at
// import time, which reads storage before any module-scope const here has run.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  (globalThis as Record<string, unknown>).__mockStorage = store;
  return {
    setItem: jest.fn((k: string, v: string) => {
      store.set(k, v);
      return Promise.resolve();
    }),
    getItem: jest.fn((k: string) => Promise.resolve(store.get(k) ?? null)),
    removeItem: jest.fn((k: string) => {
      store.delete(k);
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach((k) => store.delete(k));
      return Promise.resolve();
    }),
  };
});

// react-redux ships an ESM build this project's transformIgnorePatterns does
// not transform. useAutoLogin only needs a dispatcher, so bind the hooks
// straight to the store under test rather than pulling the real package in.
jest.mock('react-redux', () => ({
  useDispatch: () => require('@/store').store.dispatch,
  useSelector: (selector: (state: unknown) => unknown) =>
    selector(require('@/store').store.getState()),
}));

import { store } from '@/store';
import { clearAuth, setUser } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { asyncStorageManager } from '@/lib/auth/asyncStorageManager';
import { useAutoLogin } from '@/hooks/useAutoLogin';

const mockMemory = (globalThis as Record<string, unknown>)
  .__mockStorage as Map<string, string>;

const USER = { id: 7, email: 'fardin@example.com', fullName: 'Fardin' } as never;

describe('auth session consistency', () => {
  beforeEach(() => {
    mockMemory.clear();
    store.dispatch(clearAuth());
    // Boot refreshes the user from /auth/me; keep these tests off the network.
    jest
      .spyOn(authService, 'getCurrentUser')
      .mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clears the persisted redux flag when a forced logout drops the token', async () => {
    await asyncStorageManager.storeAuthData({ accessToken: 'jwt', user: USER });
    store.dispatch(setUser(USER));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    // What the httpservice 401 interceptor does when a refresh is impossible.
    await authService.logout();

    expect(await asyncStorageManager.getToken()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it('does not stay authenticated on boot when storage has no session', async () => {
    // redux-persist has rehydrated a previous session; storage has nothing.
    store.dispatch(setUser(USER));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    renderHook(() => useAutoLogin());

    await waitFor(() =>
      expect(store.getState().auth.isAuthenticated).toBe(false)
    );
  });

  it('does not stay authenticated on boot when the stored session has expired', async () => {
    mockMemory.set('token', 'jwt');
    mockMemory.set('user', JSON.stringify(USER));
    mockMemory.set('tokenExpiry', String(Math.floor(Date.now() / 1000) - 60));
    store.dispatch(setUser(USER));

    renderHook(() => useAutoLogin());

    await waitFor(() =>
      expect(store.getState().auth.isAuthenticated).toBe(false)
    );
    // The dead token must go too, or the interceptor keeps sending it.
    expect(await asyncStorageManager.getToken()).toBeNull();
  });

  it('restores the session when storage holds a live one', async () => {
    await asyncStorageManager.storeAuthData({
      accessToken: 'jwt',
      user: USER,
      expiresIn: 3600,
    });

    renderHook(() => useAutoLogin());

    await waitFor(() =>
      expect(store.getState().auth.isAuthenticated).toBe(true)
    );
    expect(store.getState().auth.user).toEqual(USER);
  });

  it('refreshes the restored user from /auth/me so learning_track is current', async () => {
    await asyncStorageManager.storeAuthData({
      accessToken: 'jwt',
      user: USER,
      expiresIn: 3600,
    });
    const fresh = {
      id: 7,
      email: 'fardin@example.com',
      fullName: 'Fardin',
      learning_track: 'ielts',
      ielts_default_focus: 'mock_exam',
      ielts_target_band: 7,
    };
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(fresh);
    const expiryBefore = await asyncStorageManager.getTokenExpiry();

    renderHook(() => useAutoLogin());

    await waitFor(() =>
      expect(store.getState().auth.user?.learning_track).toBe('ielts')
    );
    expect(store.getState().auth.user?.ielts_default_focus).toBe('mock_exam');
    expect(store.getState().auth.isAuthenticated).toBe(true);
    // useAutoLogin persists the fresh user; the token expiry is left alone.
    expect((await asyncStorageManager.getUser())?.learning_track).toBe('ielts');
    expect(await asyncStorageManager.getTokenExpiry()).toBe(expiryBefore);
  });

  it('a logout during the /auth/me refresh is not undone by it', async () => {
    await asyncStorageManager.storeAuthData({
      accessToken: 'jwt',
      user: USER,
      expiresIn: 3600,
    });
    let resolveMe: (u: unknown) => void = () => {};
    (authService.getCurrentUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => (resolveMe = resolve))
    );

    renderHook(() => useAutoLogin());
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

    await authService.logout();
    resolveMe({ ...(USER as object), learning_track: 'ielts' });
    await new Promise((r) => setTimeout(r, 0));

    expect(await asyncStorageManager.getUser()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  it('a /auth/me refresh for a previous user does not overwrite a new login', async () => {
    await asyncStorageManager.storeAuthData({
      accessToken: 'jwt',
      user: USER,
      expiresIn: 3600,
    });
    let resolveMe: (u: unknown) => void = () => {};
    (authService.getCurrentUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => (resolveMe = resolve))
    );

    renderHook(() => useAutoLogin());
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

    const OTHER = { id: 8, email: 'other@example.com', fullName: 'Other' } as never;
    await asyncStorageManager.storeAuthData({ accessToken: 'jwt2', user: OTHER, expiresIn: 3600 });
    store.dispatch(setUser(OTHER));
    resolveMe({ ...(USER as object), learning_track: 'ielts' });
    await new Promise((r) => setTimeout(r, 0));

    expect((await asyncStorageManager.getUser())?.id).toBe(8);
    expect(store.getState().auth.user?.id).toBe(8);
  });

  it('getCurrentUser returns the merged user without writing storage', async () => {
    (authService.getCurrentUser as jest.Mock).mockRestore();
    await asyncStorageManager.storeAuthData({
      accessToken: 'jwt',
      user: USER,
      expiresIn: 3600,
    });
    const expiryBefore = await asyncStorageManager.getTokenExpiry();
    const { httpService } = require('@/services/http/httpservice');
    jest.spyOn(httpService, 'get').mockResolvedValue({
      data: { success: true, data: { id: 7, email: 'fardin@example.com', learning_track: 'ielts' } },
    });

    const user = await authService.getCurrentUser();

    expect(user.learning_track).toBe('ielts');
    expect(user.fullName).toBe('Fardin');
    // Storage is written by useAutoLogin, after its logout guard.
    expect((await asyncStorageManager.getUser())?.learning_track).toBeUndefined();
    expect(await asyncStorageManager.getTokenExpiry()).toBe(expiryBefore);
  });
});
