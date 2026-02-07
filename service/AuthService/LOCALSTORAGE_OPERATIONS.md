# localStorage Operations in Login/Registration Flow

## Overview

During the login and registration flow, the `AuthService` automatically stores authentication data in `localStorage` to maintain user sessions across page refreshes and browser restarts.

## localStorage Keys Used

### 1. `accessToken`
- **What**: JWT access token for authenticated API requests
- **When Stored**: After successful login, registration, or Google OAuth
- **Why**: 
  - Required for all authenticated API calls (sent in `Authorization: Bearer <token>` header)
  - Enables the app to make authenticated requests without re-logging in
  - Persists across page refreshes so users stay logged in
- **Location**: `AuthService.storeAuthData()` → `localStorage.setItem('accessToken', ...)`
- **Read By**: 
  - `httpService` (automatically adds to request headers)
  - `AuthService.getToken()` (for manual token access)
  - Redux `initializeAuth` action (on app start)

### 2. `refreshToken`
- **What**: JWT refresh token for obtaining new access tokens
- **When Stored**: After successful login, registration, or Google OAuth (if provided by server)
- **Why**:
  - Access tokens expire (typically after 7 days)
  - Refresh token allows getting a new access token without re-logging in
  - Provides seamless token renewal for better UX
- **Location**: `AuthService.storeAuthData()` → `localStorage.setItem('refreshToken', ...)`
- **Read By**:
  - `httpService.refreshToken()` (when access token expires)
  - Redux `initializeAuth` action (on app start)

### 3. `tokenExpiry`
- **What**: Unix timestamp (in seconds) when the access token expires
- **When Stored**: After successful login, registration, or Google OAuth
- **Calculation**: `currentTime + expiresIn` (from API response, defaults to 7 days)
- **Why**:
  - Allows checking if token is still valid without making an API call
  - Used by `AuthService.isAuthenticated()` to verify token validity
  - Prevents unnecessary API calls with expired tokens
- **Location**: `AuthService.storeAuthData()` → `localStorage.setItem('tokenExpiry', ...)`
- **Read By**:
  - `AuthService.isTokenValid()` (checks if token hasn't expired)
  - `httpService` interceptor (checks before attempting token refresh)

### 4. `user`
- **What**: User profile data (id, email, fullName, etc.) as JSON string
- **When Stored**: After successful login, registration, or Google OAuth
- **Why**:
  - Provides immediate access to user info without API call
  - Used for displaying user name/email in UI
  - Enables quick authentication checks
  - Persists user data across page refreshes
- **Location**: `AuthService.storeAuthData()` → `localStorage.setItem('user', JSON.stringify(...))`
- **Read By**:
  - `AuthService.getUser()` (for accessing user data)
  - Redux `initializeAuth` action (to restore user state on app start)
  - Various components that need user info

## Flow Diagram

### Login Flow
```
User submits login form
    ↓
AuthService.login() called
    ↓
API call to /auth/login
    ↓
Success response with tokens + user data
    ↓
AuthService.storeAuthData() called
    ↓
localStorage.setItem('accessToken', token)
localStorage.setItem('refreshToken', refreshToken) [if provided]
localStorage.setItem('tokenExpiry', expiryTimestamp)
localStorage.setItem('user', JSON.stringify(user))
    ↓
Redux state updated (via async thunk)
    ↓
User redirected to /home
```

### Registration Flow
```
User submits registration form
    ↓
AuthService.register() called
    ↓
API call to /auth/register
    ↓
Success response with tokens + user data
    ↓
AuthService.storeAuthData() called
    ↓
Same localStorage operations as login
    ↓
Redux state updated
    ↓
User redirected to /home
```

### Google OAuth Flow
```
User clicks "Continue with Google"
    ↓
Google OAuth popup → authorization code
    ↓
AuthService.googleOAuth() called with code
    ↓
API call to /auth/google
    ↓
Success response with tokens + user data
    ↓
AuthService.storeAuthData() called
    ↓
Same localStorage operations as login
    ↓
Redux state updated
    ↓
User redirected to /home
```

## App Initialization (On Page Load)

When the app starts, Redux `initializeAuth` action runs:

```typescript
// In StoreProvider.tsx
useEffect(() => {
  dispatch(initializeAuth());
}, [dispatch]);
```

This reads from localStorage:
- `localStorage.getItem('accessToken')` → Redux state
- `localStorage.getItem('refreshToken')` → Redux state  
- `localStorage.getItem('user')` → Redux state
- Checks `tokenExpiry` to verify token is still valid

**Why**: Restores authentication state after page refresh, so users don't have to log in again.

## Cleanup Operations

### Logout
When user logs out:
```typescript
AuthService.logout()
    ↓
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
localStorage.removeItem('tokenExpiry')
localStorage.removeItem('user')
    ↓
Redux state cleared
```

## Why localStorage Instead of Alternatives?

1. **Persistence**: Data survives page refreshes and browser restarts
2. **No Server Dependency**: Works offline (for cached data)
3. **Fast Access**: No network latency for reading user/token data
4. **Simple Implementation**: Built into browsers, no extra dependencies
5. **SPA Standard**: Common pattern for Single Page Applications

## Security Considerations

⚠️ **Important Notes**:
- Tokens in localStorage are accessible to JavaScript (XSS risk)
- We rely on:
  - HTTPS for transport security
  - Short token expiry times
  - Refresh token rotation
  - Proper input sanitization
- For higher security, consider httpOnly cookies (requires backend changes)

## Summary Table

| Key | Purpose | Stored When | Read When |
|-----|---------|-------------|-----------|
| `accessToken` | API authentication | Login/Register/OAuth | Every API request, auth checks |
| `refreshToken` | Token renewal | Login/Register/OAuth | When access token expires |
| `tokenExpiry` | Token validity check | Login/Register/OAuth | Auth checks, before API calls |
| `user` | User profile data | Login/Register/OAuth | UI display, auth checks, app init |

## Code Locations

- **Storage**: `AuthService.storeAuthData()` (lines 35-55)
- **Retrieval**: `AuthService.getStoredToken()`, `getStoredUser()`, `isTokenValid()` (lines 78-119)
- **Cleanup**: `AuthService.clearAuthData()` (lines 61-72)
- **Initialization**: Redux `initializeAuth` action in `authSlice.ts` (lines 154-175)
