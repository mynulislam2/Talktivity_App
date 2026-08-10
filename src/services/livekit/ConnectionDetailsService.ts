import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export type WebSessionType = 'call' | 'practice' | 'roleplay';

export interface WebTopicData {
  title?: string;
  prompt?: string;
  firstPrompt?: string;
}

export interface WebConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantToken: string;
  participantName: string;
  sessionType: string;
  userId: string;
  createdAt: string;
}

export interface ConnectionDetailsParams {
  userId: number;
  sessionType: WebSessionType;
  topic?: WebTopicData | null;
}

class ConnectionDetailsService {
  async getConnectionDetails(
    params: ConnectionDetailsParams
  ): Promise<WebConnectionDetails> {
    const { userId, sessionType, topic } = params;

    const query: Record<string, string> = {
      id: String(userId),
      sessionType,
    };

    if (topic?.title) {
      query.topicTitle = topic.title;
    }
    if (topic?.prompt) {
      query.prompt = topic.prompt;
    }
    if (topic?.firstPrompt) {
      query.firstPrompt = topic.firstPrompt;
    }

    const response = await httpService.get(
      API_URLS.LIVEKIT.CONNECTION_DETAILS,
      {
        params: query,
      }
    );

    const data =
      (response.data && (response.data.data ?? response.data)) || response.data;

    return data as WebConnectionDetails;
  }
}

export const connectionDetailsService = new ConnectionDetailsService();
