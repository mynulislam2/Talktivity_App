
import { httpService } from "../httpservice";

class GroupsService {
  // List all groups (GET /api/groups)
  async listGroups(): Promise<any> {
    const response = await httpService.get("/groups");
    return response.data;
  }

  // Create a new group (POST /api/groups/create)
  async createGroup(data: any): Promise<any> {
    const response = await httpService.post("/groups/create", data);
    return response.data;
  }

  // Join a group (POST /api/groups/:groupId/join)
  async joinGroup(groupId: string): Promise<any> {
    const response = await httpService.post(`/groups/${groupId}/join`, {});
    return response.data;
  }

  // Leave a group (POST /api/groups/:groupId/leave)
  async leaveGroup(groupId: string): Promise<any> {
    const response = await httpService.post(`/groups/${groupId}/leave`, {});
    return response.data;
  }

  // Get group members (GET /api/groups/:groupId/members)
  async getMembers(groupId: string): Promise<any> {
    const response = await httpService.get(`/groups/${groupId}/members`);
    return response.data;
  }

  // Get group messages (GET /api/groups/:groupId/messages)
  async getMessages(groupId: string, params = ""): Promise<any> {
    const response = await httpService.get(`/groups/${groupId}/messages${params}`);
    return response.data;
  }

  // Pin a message (POST /api/groups/:groupId/messages/:messageId/pin)
  async pinMessage(groupId: string, messageId: string): Promise<any> {
    const response = await httpService.post(`/groups/${groupId}/messages/${messageId}/pin`, {});
    return response.data;
  }

  // Unpin all messages (POST /api/groups/:groupId/messages/unpin)
  async unpinMessages(groupId: string): Promise<any> {
    const response = await httpService.post(`/groups/${groupId}/messages/unpin`, {});
    return response.data;
  }

  // Mute/unmute group (POST /api/groups/:groupId/mute)
  async muteGroup(groupId: string): Promise<any> {
    const response = await httpService.post(`/groups/${groupId}/mute`, {});
    return response.data;
  }

  // Get last read timestamps (GET /api/groups/last-read)
  async getLastRead(): Promise<any> {
    const response = await httpService.get(`/groups/last-read`);
    return response.data;
  }

  // Delete a group (DELETE /api/groups/:groupId)
  async deleteGroup(groupId: string): Promise<any> {
    const response = await httpService.delete(`/groups/${groupId}`);
    return response.data;
  }

  // Get groups user has joined (GET /api/groups/joined)
  async getJoinedGroups(): Promise<any> {
    const response = await httpService.get(`/groups/joined`);
    return response.data;
  }
}

export const groupsService = new GroupsService();
