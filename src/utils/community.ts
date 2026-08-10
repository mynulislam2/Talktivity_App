export function hasUnreadDM(dm: any): boolean {
  return Boolean(dm?.unread_count > 0 || dm?.has_unread);
}

export function hasUnreadGroup(group: any, lastRead?: string): boolean {
  if (!lastRead) return true;
  if (!group?.last_message_at) return false;
  return new Date(group.last_message_at) > new Date(lastRead);
}

export function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function resolveApiAssetUrl(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Build absolute URL from relative path
  return `${src}`;
}

export function getGroupActivityTimestamp(group: any): string | undefined {
  return group?.last_message_at || group?.updated_at || group?.created_at;
}
