# AuthService

The Authentication Service provides a centralized, type-safe interface for all authentication operations in the application.

## Overview

`AuthService` acts as the data access layer for authentication, handling:
- API calls to authentication endpoints
- Token storage and retrieval from localStorage
- User data management
- Error handling and transformation

## Architecture

The service follows a layered architecture:
- **Public API**: Methods for login, register, OAuth, logout, and state queries
- **Private Methods**: Internal token management and storage operations
- **Error Handling**: Automatic conversion of API errors to typed `AuthError` instances

## Usage

### Basic Authentication

```typescript
import { authService } from '@/service/AuthService';

// Login
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', response.data.user);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle invalid credentials
  }
}

// Register
const response = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe'
});

// Google OAuth
const response = await authService.googleOAuth({
  code: 'google-auth-code'
});
```

### State Queries

```typescript
// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getUser();

// Get access token
const token = authService.getToken();
```

### Logout

```typescript
await authService.logout();
// Automatically clears all auth data from localStorage
```

## Token Management

The service automatically handles token storage:
- **Access Token**: Stored in `localStorage` as `accessToken`
- **Refresh Token**: Stored in `localStorage` as `refreshToken` (if provided)
- **Token Expiry**: Calculated and stored as `tokenExpiry` (Unix timestamp)
- **User Data**: Stored in `localStorage` as `user` (JSON stringified)

All tokens are automatically stored after successful authentication operations.

## Error Handling

The service throws typed errors that can be caught and handled:

```typescript
import { AuthenticationError, ValidationError, NetworkError } from '@/lib/auth/errors';

try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // 401 - Invalid credentials
  } else if (error instanceof ValidationError) {
    // 400 - Invalid input
  } else if (error instanceof NetworkError) {
    // Network issues
  }
}
```

## Integration with Redux

While `AuthService` handles API calls and localStorage, the Redux store manages in-memory state. The service is used by Redux async thunks in `authSlice.ts`.

## API Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

## Type Safety

All methods are fully typed using TypeScript interfaces from `@/types/auth`:
- `LoginRequest`
- `RegisterRequest`
- `AuthResponse`
- `User`

No `any` types are used - ensuring compile-time type safety.
