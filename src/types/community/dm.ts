/**
 * DM (Direct Message) Types
 */

export interface DM {
  id: number;
  participant_ids: number[];
  participant_names: string[];
  participant_avatars?: string[];
  last_message?: string;
  last_message_time?: string;
  last_message_read?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DMMessage {
  id: number;
  dm_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  is_pinned?: boolean;
}

export interface DMConversation {
  dm: DM;
  messages: DMMessage[];
  unread_count?: number;
}
