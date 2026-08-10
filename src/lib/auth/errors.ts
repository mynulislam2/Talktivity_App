/**
 * Custom error classes for authentication
 */

import { AuthErrorCode } from '@/types/auth';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, public field?: string) {
    super(message, AuthErrorCode.VALIDATION_ERROR, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed') {
    super(message, AuthErrorCode.AUTHENTICATION_ERROR, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class NetworkError extends AuthError {
  constructor(message: string = 'Network request failed') {
    super(message, AuthErrorCode.NETWORK_ERROR);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ServerError extends AuthError {
  constructor(
    message: string = 'Server error occurred',
    statusCode: number = 500
  ) {
    super(message, AuthErrorCode.SERVER_ERROR, statusCode);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
