/**
 * User-related type definitions for authentication
 * 
 * Note: Backend returns snake_case fields, but we maintain camelCase in the type
 * for consistency. Components should handle both formats.
 */

export interface User {
  id: string | number;
  email: string;
  full_name?: string; // Backend format (snake_case)
  fullName?: string; // Frontend format (camelCase) - for compatibility
  created_at?: string; // Backend format
  createdAt?: string; // Frontend format - for compatibility
  profile_picture?: string; // Backend format (snake_case)
  profilePicture?: string; // Frontend format (camelCase) - for compatibility
  [key: string]: any; // Allow additional fields from backend
}
