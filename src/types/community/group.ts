/**
 * Group Types
 */

export interface Group {
  id: number;
  name: string;
  description?: string;
  category?: string;
  member_count: number;
  cover_image?: string;
  last_message_at?: string;
  last_message?: string;
  last_message_sender_name?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  creator_id?: number;
}

export interface GroupMember {
  id: number;
  full_name: string;
  email: string;
  profile_picture?: string;
  joined_at?: string;
  // Optional role information (may be returned by some API variants)
  role?: string;
}

export interface GroupMessage {
  id: number;
  group_id: number;
  sender_id: number;
  sender_name?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_pinned?: boolean;
}

export interface LastReadStatus {
  group_id: number;
  last_read_at: string;
}
