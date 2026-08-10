import { useCallback, useState } from 'react';
import { groupTyping, sendGroupMessage } from '@/services/socket';
import { createLocalMessageId } from '@/lib/chat/optimistic';

export interface UseGroupComposerOptions {
  groupId: number | null;
  userId: number | null;
  userName: string;
  userAvatar: string | null;
  onOptimisticMessage: (msg: any) => void;
}

export function useGroupComposer({
  groupId,
  userId,
  userName,
  userAvatar,
  onOptimisticMessage,
}: UseGroupComposerOptions) {
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !groupId || !userId) return;

    const tempId = createLocalMessageId();
    const now = new Date().toISOString();

    onOptimisticMessage({
      id: tempId,
      content: text,
      user_id: userId,
      full_name: userName || 'You',
      profile_picture: userAvatar || null,
      created_at: now,
    });

    sendGroupMessage(groupId, text);
    setInput('');
    groupTyping(groupId, userId, false);
  }, [groupId, input, onOptimisticMessage, userAvatar, userId, userName]);

  const handleChange = useCallback(
    (v: string) => {
      setInput(v);
      if (userId && groupId) groupTyping(groupId, userId, true);
    },
    [groupId, userId]
  );

  const handleBlur = useCallback(() => {
    if (userId && groupId) groupTyping(groupId, userId, false);
  }, [groupId, userId]);

  const handleEmojiSelect = useCallback((emoji: any) => {
    setInput((prev) => prev + emoji.native);
    setShowEmoji(false);
  }, []);

  return {
    input,
    setInput,
    showEmoji,
    setShowEmoji,
    handleSend,
    handleChange,
    handleBlur,
    handleEmojiSelect,
  };
}
