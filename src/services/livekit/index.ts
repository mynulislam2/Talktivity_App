import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

class LivekitSessionService {
  async notifySessionEnded(roomName: string): Promise<void> {
    await httpService.post(API_URLS.LIVEKIT.SESSION_ENDED, { roomName });
  }
}

export const livekitSessionService = new LivekitSessionService();
export { LivekitSessionService };
