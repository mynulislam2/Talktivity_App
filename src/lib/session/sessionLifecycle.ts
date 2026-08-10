import type { SessionStatePayload } from '@/services/socket';
import { livekitSessionService } from '@/services/livekit';

export function getActiveRoomName(
  connectionDetails: { roomName?: string } | null | undefined
): string | null {
  const roomName = connectionDetails?.roomName;
  return roomName && roomName.trim().length > 0 ? roomName : null;
}

export function isEventForActiveRoom(
  payload: SessionStatePayload,
  activeRoomName: string | null
): boolean {
  if (!payload.call_id || !activeRoomName) {
    return false;
  }
  return payload.call_id === activeRoomName;
}

export async function endLivekitSession(options: {
  roomName: string | null;
  endLocalSession: () => void | Promise<void>;
}): Promise<void> {
  const { roomName, endLocalSession } = options;

  if (roomName) {
    void livekitSessionService.notifySessionEnded(roomName);
  }

  await endLocalSession();
}
