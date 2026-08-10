import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '@/constants';

export interface ListeningCharacter {
  name: string;
  role?: string | null;
}

export interface ListeningTopic {
  id?: number;
  title: string;
  category?: string;
  audio?: string;
  characters?: ListeningCharacter[];
  conversation?: string;
}

export const LISTENING_TOPIC_STORAGE_KEY = 'selectedListeningTopic';

function normalizeTopicTitle(value?: string) {
  return value?.trim().toLowerCase() || '';
}

export function getFallbackListeningTopic(): ListeningTopic {
  return ((constants as ListeningTopic[])?.[0] || {
    title: 'Listening Lesson',
    conversation: '',
  }) as ListeningTopic;
}

export function findListeningTopic(topic?: Partial<ListeningTopic> | null) {
  if (!topic) return null;

  const normalizedTitle = normalizeTopicTitle(topic.title);

  return (
    (constants as ListeningTopic[]).find((candidate) => {
      if (topic.id && candidate.id === topic.id) return true;
      return normalizedTitle
        ? normalizeTopicTitle(candidate.title) === normalizedTitle
        : false;
    }) || null
  );
}

export function hydrateListeningTopic(
  topic?: Partial<ListeningTopic> | null
): ListeningTopic {
  const defaultTopic = getFallbackListeningTopic();

  if (!topic) {
    return defaultTopic;
  }

  const fallback = findListeningTopic(topic);
  const baseTopic = fallback || defaultTopic;

  return {
    ...baseTopic,
    ...topic,
    title: topic.title || baseTopic.title,
    category: topic.category || baseTopic.category,
    audio: topic.audio || baseTopic.audio,
    characters: topic.characters?.length
      ? topic.characters
      : baseTopic.characters,
    conversation: topic.conversation || baseTopic.conversation,
  };
}

export async function resolveStoredListeningTopic(): Promise<ListeningTopic> {
  try {
    const storedTopic = await AsyncStorage.getItem(LISTENING_TOPIC_STORAGE_KEY);
    if (!storedTopic) return getFallbackListeningTopic();

    const parsed = JSON.parse(storedTopic);
    if (parsed && typeof parsed === 'object') {
      return hydrateListeningTopic(parsed as Partial<ListeningTopic>);
    }
  } catch {
    // Ignore invalid payloads and fall back to bundled topics.
  }

  return getFallbackListeningTopic();
}

export async function persistListeningTopic(
  topic?: Partial<ListeningTopic> | null
): Promise<ListeningTopic> {
  const resolvedTopic = hydrateListeningTopic(topic);

  await AsyncStorage.setItem(
    LISTENING_TOPIC_STORAGE_KEY,
    JSON.stringify(resolvedTopic)
  );

  return resolvedTopic;
}

export function resolveListeningAudioUrl(audioPath?: string) {
  if (!audioPath) return '';
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://'))
    return audioPath;

  const normalizedPath = audioPath.replace(/^\/+/, '');
  return `https://audio.talktivity.app/${normalizedPath}`;
}

export function hasListeningTopicEssentials(
  topic?: Partial<ListeningTopic> | null
) {
  return Boolean(topic?.audio && topic?.conversation);
}
