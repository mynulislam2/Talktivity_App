import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { sendGroupMessage } from '@/store/slices/communitySlice';
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
  const dispatch = useAppDispatch();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !groupId || !userId) return;

    const tempId = createLocalMessageId();
    const now = new Date().toISOString();

    // Optimistic update
    onOptimisticMessage({
      id: tempId,
      content: text,
      user_id: userId,
      full_name: userName || 'You',
      profile_picture: userAvatar || null,
      created_at: now,
      is_own: true,
    });

    // Send via Redux
    try {
      await dispatch(sendGroupMessage({ groupId, content: text })).unwrap();
    } catch (error) {
      console.error('Failed to send group message:', error);
      // Optimistic message will be replaced by server response
    }

    setInput('');
  }, [groupId, input, onOptimisticMessage, userAvatar, userId, userName, dispatch]);

  const handleChange = useCallback(
    (v: string) => {
      setInput(v);
      // Typing indicators can be added here when socket is integrated
    },
    []
  );

  const handleBlur = useCallback(() => {
    // Typing indicators can be added here when socket is integrated
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInput((prev) => prev + emoji);
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
