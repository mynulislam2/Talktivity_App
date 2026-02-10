/**
 * useAudioLevels Hook (React Native)
 * 
 * Detects and normalizes audio levels for local and remote participants.
 * Provides volume strength values (0-1) for voice visualizer gradients.
 * 
 * Note: LiveKit React Native has limited audio analysis APIs.
 * This is a simplified implementation that monitors participation state.
 * For advanced audio visualization, consider using:
 * - Extracting raw audio data from WebRTC streams
 * - Using a separate audio processing library
 * - Polling participant activity state
 */

import { useEffect, useRef, useState } from 'react';
import {
  useLocalParticipant,
  useRemoteParticipants,
  useRoom,
  useConnectionState,
} from '@/hooks/livekit-native';

interface AudioLevelConfig {
  updateInterval?: number; // ms between level updates
  smoothingFactor?: number; // 0-1, higher = smoother
  userSmoothingFactor?: number; // Different smoothing for user vs agent
}

/**
 * Hook to detect audio levels for user (local) and agent (remote) participants.
 * Returns current volume strength values (0-1) for use in voice visualizers.
 */
export function useAudioLevels(config: AudioLevelConfig = {}) {
  const {
    updateInterval = 50,
    smoothingFactor = 0.2,
    userSmoothingFactor = 0.35,
  } = config;

  const room = useRoom();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const connectionState = useConnectionState();

  const [userVolumeStrength, setUserVolumeStrength] = useState(0);
  const [agentVolumeStrength, setAgentVolumeStrength] = useState(0);

  // Refs for smoothing
  const prevUserVolumeRef = useRef(0);
  const prevAgentVolumeRef = useRef(0);
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  /**
   * Calculate volume strength based on particant activity.
   * This is a simplified approach - actual audio levels would require
   * access to WebRTC statistics or audio data processing.
   */
  const calculateUserVolume = (): number => {
    if (!localParticipant) return 0;

    // Check if local participant is speaking or has recently published audio
    // LiveKit tracks: isSpeaking, audioLevel (if available)
    
    // Simplified: use isSpeaking state if available
    // In production, you might use WebRTC stats: RTCStats.inboundRtpStream.audioLevel
    
    // For now, return a basic detection based on participant presence
    if ('audioLevel' in localParticipant) {
      const audioLevel = (localParticipant as any).audioLevel || 0;
      return Math.min(1, audioLevel * 2); // Scale and clamp
    }

    return 0;
  };

  const calculateAgentVolume = (): number => {
    if (remoteParticipants.length === 0) return 0;

    const agentParticipant = remoteParticipants[0]; // First remote is typically the agent
    if (!agentParticipant) return 0;

    // Similar to user volume calculation
    if ('audioLevel' in agentParticipant) {
      const audioLevel = (agentParticipant as any).audioLevel || 0;
      return Math.min(1, audioLevel * 2);
    }

    return 0;
  };

  /**
   * Apply exponential moving average smoothing.
   */
  const applySmoothing = (
    current: number,
    previous: number,
    factor: number
  ): number => {
    return previous * (1 - factor) + current * factor;
  };

  /**
   * Update volume levels on interval.
   */
  useEffect(() => {
    if (connectionState !== 'connected') {
      setUserVolumeStrength(0);
      setAgentVolumeStrength(0);
      prevUserVolumeRef.current = 0;
      prevAgentVolumeRef.current = 0;
      return;
    }

    updateIntervalRef.current = setInterval(() => {
      // Calculate raw volumes
      const rawUserVolume = calculateUserVolume();
      const rawAgentVolume = calculateAgentVolume();

      // Apply smoothing
      const smoothedUserVolume = applySmoothing(
        rawUserVolume,
        prevUserVolumeRef.current,
        userSmoothingFactor
      );
      const smoothedAgentVolume = applySmoothing(
        rawAgentVolume,
        prevAgentVolumeRef.current,
        smoothingFactor
      );

      // Update refs
      prevUserVolumeRef.current = smoothedUserVolume;
      prevAgentVolumeRef.current = smoothedAgentVolume;

      // Update state
      setUserVolumeStrength(smoothedUserVolume);
      setAgentVolumeStrength(smoothedAgentVolume);
    }, updateInterval);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [room, localParticipant, remoteParticipants, connectionState]);

  return {
    userVolumeStrength,
    agentVolumeStrength,
  };
}

/**
 * Hook to extract audio levels from participant objects.
 * This might work if LiveKit provides audioLevel properties.
 * 
 * Alternative implementation using WebRTC stats:
 * 
 * async function getParticipantAudioLevel(participant: Participant): Promise<number> {
 *   // Access WebRTC peer connection if available
 *   const inboundStats = await getStatsReport(participant.connection);
 *   const audioTracks = inboundStats.filter(s => s.kind === 'audio');
 *   
 *   if (audioTracks.length === 0) return 0;
 *   
 *   // audioLevel is reported in RTCInboundRtpStreamStats (0-32767)
 *   const levels = audioTracks.map(t => t.audioLevel || 0);
 *   const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
 *   
 *   // Normalize to 0-1 range
 *   return Math.min(1, avg / 32767);
 * }
 */
