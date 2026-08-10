export interface Group {
  id: number;
  name: string;
  description?: string;
  category?: string;
  is_public: boolean;
  cover_image?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_common: boolean;
  created_at: string;
  created_by?: number;
  member_count: number; // Use this instead of 'members' for consistency
}

export interface GroupMember {
  id: number;
  full_name: string;
  profile_picture?: string;
  role?: string;
}

export interface GroupResponse {
  success: boolean;
  groups: Group[];
}

export interface GroupMembersResponse {
  success: boolean;
  members: GroupMember[];
  member_count: number; // Added for consistency
}
