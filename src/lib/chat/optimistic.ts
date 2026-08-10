/**
 * Create a temporary local message ID for optimistic updates.
 * These IDs are negative to avoid conflicts with server IDs.
 */
let localIdCounter = -1;

export function createLocalMessageId(): number {
  return localIdCounter--;
}
