export interface ChatProfile {
  id: number;
  full_name?: string;
  profile_picture?: string | null;
}

/**
 * Best-effort enrichment of a realtime message payload to include name/avatar fields.
 * Keeps logic centralized so DM/Group can share it.
 */
export function enrichMessageProfile<T extends Record<string, any>>(
  msg: T,
  options: {
    currentUserId: number | null;
    currentUserName: string;
    currentUserAvatar: string | null;
    otherUser?: { id: number; name?: string; avatar?: string | null } | null;
  }
): T {
  const enriched: any = { ...msg };
  const senderId = enriched.sender_id ?? enriched.user_id ?? enriched.senderId;

  // Name
  if (!enriched.full_name && !enriched.sender_name) {
    if (options.currentUserId != null && String(senderId) === String(options.currentUserId)) {
      enriched.full_name = options.currentUserName || 'You';
    } else if (options.otherUser && String(senderId) === String(options.otherUser.id)) {
      enriched.full_name = options.otherUser.name || enriched.full_name;
    }
  }

  // Avatar
  if (!enriched.profile_picture) {
    if (options.currentUserId != null && String(senderId) === String(options.currentUserId)) {
      enriched.profile_picture = options.currentUserAvatar || null;
    } else if (options.otherUser && String(senderId) === String(options.otherUser.id)) {
      enriched.profile_picture = options.otherUser.avatar || null;
    }
  }

  return enriched;
}

