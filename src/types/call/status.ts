/**
 * Call Status Types
 *
 * Type definitions for call status API responses and related data structures.
 */

// Call statistics from GET /api/call/status
export interface CallStatistics {
  total_sessions: number;
  completed_sessions: number;
  total_duration_seconds: number;
  avg_duration_seconds: number;
  last_call_at: string | null;
  full_sessions: number;
}

// Individual call session record
export interface CallSession {
  id: number;
  call_started_at: string;
  call_ended_at: string | null;
  call_duration_seconds: number;
  call_completed: boolean;
  session_type: string;
  topic_name: string | null;
  topic_id: number | null;
  room_name: string;
}

// Lifetime call eligibility and usage
export interface CallLifetime {
  totalDuration: number; // Total seconds used (from call_sessions table)
  remaining: number; // Remaining seconds (300 - totalDuration)
  canCall: boolean; // Eligibility flag (totalDuration < 300)
}

// Complete call status response
export interface CallStatusResponse {
  statistics: CallStatistics;
  recent_sessions: CallSession[];
  lifetime: CallLifetime;
}

// API response wrapper
export interface CallStatusApiResponse {
  success: boolean;
  data: CallStatusResponse;
  message?: string;
}
