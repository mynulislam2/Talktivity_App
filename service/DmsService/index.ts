
import { httpService } from "../httpservice";

class DmsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  // List all DMs (GET /api/dms)
  async getDMList(): Promise<any> {
    const response = await httpService.get("/dms");
    return response.data;
  }

  // Start a new DM (POST /api/dms/start)
  async startDM(data: any): Promise<any> {
    const response = await httpService.post("/dms/start", data);
    return response.data;
  }

  // Get messages from a DM (GET /api/dms/:dmId/messages)
  async getMessages(dmId: string, params = ""): Promise<any> {
    const response = await httpService.get(`/dms/${dmId}/messages${params}`);
    return response.data;
  }

  // Mark DM as read (POST /api/dms/:dmId/read)
  async markAsRead(dmId: string): Promise<any> {
    const response = await httpService.post(`/dms/${dmId}/read`, {});
    return response.data;
  }

  // Archive DM (POST /api/dms/:dmId/archive)
  async archive(dmId: string): Promise<any> {
    const response = await httpService.post(`/dms/${dmId}/archive`, {});
    return response.data;
  }

  // Pin a message (POST /api/dms/:dmId/messages/:messageId/pin)
  async pinMessage(dmId: string, messageId: string): Promise<any> {
    const response = await httpService.post(`/dms/${dmId}/messages/${messageId}/pin`, {});
    return response.data;
  }

  // Unpin all messages (POST /api/dms/:dmId/messages/unpin)
  async unpinMessages(dmId: string): Promise<any> {
    const response = await httpService.post(`/dms/${dmId}/messages/unpin`, {});
    return response.data;
  }
}

export const dmsService = new DmsService();
