/**
 * Enrich message with profile data for display
 */

export interface EnrichmentContext {
  currentUserId: number | null;
  currentUserName: string;
  currentUserAvatar: string | null;
  otherUser: { id: number; name: string; avatar: string | null } | null;
}

export function enrichMessageProfile(
  msg: any,
  context: EnrichmentContext
): any {
  const isOwn = context.currentUserId != null && msg?.sender_id != null && String(msg.sender_id) === String(context.currentUserId);

  return {
    ...msg,
    is_own: isOwn,
    sender: isOwn
      ? {
          id: context.currentUserId,
          name: context.currentUserName,
          avatar: context.currentUserAvatar,
        }
      : context.otherUser
      ? {
          id: context.otherUser.id,
          name: context.otherUser.name,
          avatar: context.otherUser.avatar,
        }
      : null,
  };
}
