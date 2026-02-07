export function createLocalMessageId(): string {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isLocalMessageId(id: unknown): boolean {
  return typeof id === 'string' && id.startsWith('local-');
}

/**
 * Merge messages with simple de-duplication.
 * Prefers server messages over optimistic ones when they likely represent the same send.
 */
export function mergeMessagesDedup<T extends { id?: any; created_at?: any; timestamp?: any; sender_id?: any; content?: any }>(
  base: T[],
  incoming: T[],
  options?: { currentUserId?: number | null }
): T[] {
  const currentUserId = options?.currentUserId ?? null;
  const result: T[] = [];

  // Index base by stable id
  const byId = new Map<string, T>();
  const push = (m: T) => {
    const idKey = m?.id != null ? String(m.id) : '';
    if (idKey) {
      byId.set(idKey, m);
    }
    result.push(m);
  };

  for (const m of base) push(m);

  for (const m of incoming) {
    const idKey = m?.id != null ? String(m.id) : '';
    if (idKey && byId.has(idKey)) continue;

    // Heuristic: if server echoes our own message, skip if an optimistic message exists with same content within ~3s.
    if (currentUserId != null && m?.sender_id != null && String(m.sender_id) === String(currentUserId)) {
      const mTime = new Date(m.created_at || m.timestamp || 0).getTime();
      const dup = result.find((x) => {
        if (!isLocalMessageId(x?.id)) return false;
        if (String(x?.sender_id) !== String(currentUserId)) return false;
        if (String(x?.content || '') !== String(m?.content || '')) return false;
        const xTime = new Date(x.created_at || x.timestamp || 0).getTime();
        return Math.abs(mTime - xTime) <= 3000;
      });
      if (dup) continue;
    }

    push(m);
  }

  return result;
}

