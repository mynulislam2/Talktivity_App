/**
 * Call Error Types
 * 
 * Custom error classes for call-related operations.
 */

export class CallError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CallError';
    Object.setPrototypeOf(this, CallError.prototype);
  }
}

export class CallStatusError extends CallError {
  constructor(message: string, statusCode?: number) {
    super(message, 'CALL_STATUS_ERROR', statusCode);
    this.name = 'CallStatusError';
    Object.setPrototypeOf(this, CallStatusError.prototype);
  }
}

export class CallConnectionError extends CallError {
  constructor(message: string, statusCode?: number) {
    super(message, 'CALL_CONNECTION_ERROR', statusCode);
    this.name = 'CallConnectionError';
    Object.setPrototypeOf(this, CallConnectionError.prototype);
  }
}
