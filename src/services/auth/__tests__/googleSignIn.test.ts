/**
 * Mobile Google sign-in must follow the same path as form login.
 *
 * Form login goes through authService.login() -> the loginUser thunk, so the
 * token is normalised, written to storage AND mirrored into redux, and the
 * caller then refreshes subscription state. Google sign-in bypassed all of
 * that: it called the deprecated raw googleToken() helper and dispatched
 * setUser(), which sets isAuthenticated without an access token and never
 * reloads the subscription. It also had no notion of "this account did not
 * exist", so pressing "Continue with Google" on a login-only screen silently
 * registered a new account.
 */
jest.mock('@/services/http/httpservice', () => ({
  httpService: { post: jest.fn(), get: jest.fn() },
}));

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

import { httpService } from '@/services/http/httpservice';
import { store } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';
import { googleSignIn } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';

const mockStorage = (globalThis as Record<string, unknown>)
  .__mockStorage as Map<string, string>;
const post = httpService.post as jest.Mock;

const USER = { id: 42, email: 'fardin@example.com', fullName: 'Fardin' };

const okResponse = (overrides: Record<string, unknown> = {}) => ({
  data: {
    success: true,
    message: 'Login successful (existing user)',
    data: {
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
      expiresIn: 604800,
      token: 'access-jwt',
      isNew: false,
      user: USER,
      ...overrides,
    },
  },
});

describe('mobile Google sign-in', () => {
  beforeEach(() => {
    mockStorage.clear();
    post.mockReset();
    store.dispatch(clearAuth());
  });

  it('tells the backend this is a login, not a registration', async () => {
    post.mockResolvedValue(okResponse());

    await authService.googleIdToken({ idToken: 'google-id-token' });

    expect(post).toHaveBeenCalledWith('/auth/google-token', {
      idToken: 'google-id-token',
      mode: 'login',
    });
  });

  it('stores the token the same way form login does', async () => {
    post.mockResolvedValue(okResponse());

    await authService.googleIdToken({ idToken: 'google-id-token' });

    expect(mockStorage.get('token')).toBe('access-jwt');
    expect(mockStorage.get('refreshToken')).toBe('refresh-jwt');
    expect(JSON.parse(mockStorage.get('user') as string)).toEqual(USER);
  });

  it('mirrors the tokens into redux like the loginUser thunk', async () => {
    post.mockResolvedValue(okResponse());

    await store.dispatch(googleSignIn({ idToken: 'google-id-token' }));

    const auth = store.getState().auth;
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.accessToken).toBe('access-jwt');
    expect(auth.refreshToken).toBe('refresh-jwt');
    expect(auth.user).toEqual(USER);
  });

  it('reports an unknown Google account instead of registering one', async () => {
    post.mockRejectedValue({
      response: {
        status: 404,
        data: { success: false, error: 'No account found', code: 'ACCOUNT_NOT_FOUND' },
      },
    });

    const result = await store.dispatch(googleSignIn({ idToken: 'google-id-token' }));

    expect(googleSignIn.rejected.match(result)).toBe(true);
    expect(String(result.payload)).toMatch(/no account/i);
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(mockStorage.get('token')).toBeUndefined();
  });
});
