import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocalParticipant, useRemoteParticipants, useTracks, useVoiceAssistant, useTrackTranscription } from '@livekit/react-native';
import { Track } from 'livekit-client';
import type { AgentState } from '@livekit/react-native';

export interface TranscriptMessage {
  id: string;
  text: string;
  sender: 'agent' | 'user';
  isFinal: boolean;
  timestamp: number;
}

export interface SimpleVoiceAssistantProps {
  onStateChange?: (state: AgentState) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onUserVolumeStrength?: (strength: number) => void;
  onAgentVolumeStrength?: (strength: number) => void;
  onTranscriptsChange?: (messages: TranscriptMessage[]) => void;
}

export function SimpleVoiceAssistant({
  onStateChange,
  onSpeakingChange,
  onUserVolumeStrength,
  onAgentVolumeStrength,
  onTranscriptsChange,
}: SimpleVoiceAssistantProps) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { state, agentTranscriptions } = useVoiceAssistant();

  const prevUserVol = useRef(0);
  const prevAgentVol = useRef(0);
  const prevSpeakingRef = useRef(false);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  const allMicrophoneTracks = useTracks([Track.Source.Microphone], { onlySubscribed: false });

  const userMicrophoneTrackRef = useMemo(() => {
    return allMicrophoneTracks.find(
      track => localParticipant && track.participant?.identity === localParticipant.identity && track.publication?.track
    ) || undefined;
  }, [allMicrophoneTracks, localParticipant]);

  const { segments: userTranscriptions } = useTrackTranscription(userMicrophoneTrackRef);

  useEffect(() => {
    if (!onTranscriptsChange) return;
    const agentMessages: TranscriptMessage[] = (agentTranscriptions || []).map((seg) => ({
      id: `agent-${seg.id}`,
      text: seg.text,
      sender: 'agent' as const,
      isFinal: seg.final,
      timestamp: seg.firstReceivedTime,
    }));
    const userMessages: TranscriptMessage[] = (userTranscriptions || []).map((seg) => ({
      id: `user-${seg.id}`,
      text: seg.text,
      sender: 'user' as const,
      isFinal: seg.final,
      timestamp: seg.firstReceivedTime,
    }));
    const all = [...agentMessages, ...userMessages].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    onTranscriptsChange(all);
  }, [agentTranscriptions, userTranscriptions, onTranscriptsChange]);

  const detectUserLevel = useCallback((): number => {
    if (!localParticipant) return 0;
    const level = (localParticipant as any).audioLevel;
    if (level && level > 0)
      return Math.min(1, Math.pow(Math.min(1, level), 0.8) * 2.2);
    return (localParticipant as any).isSpeaking ? 0.3 : 0;
  }, [localParticipant]);

  const detectAgentLevel = useCallback((): number => {
    if (!remoteParticipants.length) return 0;
    const agent = remoteParticipants[0];
    if (!agent) return 0;
    const level = (agent as any).audioLevel;
    if (level && level > 0)
      return Math.min(1, Math.pow(Math.min(1, level), 0.7) * 3.5);
    return (agent as any).isSpeaking ? 0.5 : 0;
  }, [remoteParticipants]);

  useEffect(() => {
    const interval = setInterval(() => {
      const rawAgent = detectAgentLevel();
      const rawUser = detectUserLevel();
      const smoothAgent = prevAgentVol.current * 0.8 + rawAgent * 0.2;
      const smoothUser = prevUserVol.current * 0.65 + rawUser * 0.35;
      prevAgentVol.current = smoothAgent;
      prevUserVol.current = smoothUser;
      onAgentVolumeStrength?.(smoothAgent);
      onUserVolumeStrength?.(smoothUser);
    }, 50);
    return () => clearInterval(interval);
  }, [
    detectAgentLevel,
    detectUserLevel,
    onAgentVolumeStrength,
    onUserVolumeStrength,
  ]);

  return null;
}
