import { useCallback, useState } from 'react';
import { dmTyping, sendDMMessage } from '@/services/socket';
import { createLocalMessageId } from '@/lib/chat/optimistic';

export interface UseDMComposerOptions {
  dmId: number | null;
  userId: number | null;
  otherUserId: number | null;
  userName: string;
  userAvatar: string | null;
  onOptimisticMessage: (msg: any) => void;
}

export function useDMComposer({
  dmId,
  userId,
  otherUserId,
  userName,
  userAvatar,
  onOptimisticMessage,
}: UseDMComposerOptions) {
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !dmId || !userId || !otherUserId) return;

    const tempId = createLocalMessageId();
    const now = new Date().toISOString();

    onOptimisticMessage({
      id: tempId,
      content: text,
      sender_id: userId,
      user_id: userId,
      full_name: userName || 'You',
      profile_picture: userAvatar || null,
      created_at: now,
    });

    sendDMMessage(dmId, userId, otherUserId, text);
    setInput('');
    dmTyping(userId, otherUserId, false);
  }, [
    dmId,
    input,
    onOptimisticMessage,
    otherUserId,
    userAvatar,
    userId,
    userName,
  ]);

  const handleChange = useCallback(
    (v: string) => {
      setInput(v);
      if (userId && otherUserId) dmTyping(userId, otherUserId, true);
    },
    [otherUserId, userId]
  );

  const handleBlur = useCallback(() => {
    if (userId && otherUserId) dmTyping(userId, otherUserId, false);
  }, [otherUserId, userId]);

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
