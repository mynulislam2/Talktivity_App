/**
 * SimpleVoiceAssistant Component (React Native)
 * 
 * Custom component for tracking voice assistant audio and detecting volume strength.
 * Wires audio levels to the visualizer context.
 * 
 * Note: React Native has limited access to raw audio data compared to web.
 * This implementation uses participant state polling and RTCStats when available.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  useLocalParticipant,
  useRemoteParticipants,
} from '@/hooks/livekit-native';

export interface SimpleVoiceAssistantProps {
  onUserVolumeStrength?: (strength: number) => void;
  onAgentVolumeStrength?: (strength: number) => void;
  updateInterval?: number; // ms between updates
}

/**
 * SimpleVoiceAssistant for React Native.
 * 
 * In the web version, this component:
 * - Uses useTracks() to get audio tracks
 * - Uses useMultibandTrackVolume() to analyze frequency bins
 * - Calculates RMS and weighted frequency response
 * - Applies smoothing and normalization
 * 
 * In RN, we have limited audio analysis capabilities.
 * This version uses a simplified approach that can be enhanced
 * once more audio APIs are available.
 */
export function SimpleVoiceAssistant({
  onUserVolumeStrength,
  onAgentVolumeStrength,
  updateInterval = 50,
}: SimpleVoiceAssistantProps) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Refs for smoothing calculation
  const prevUserVolumeRef = useRef(0);
  const prevAgentVolumeRef = useRef(0);
  const smoothingFactorRef = useRef(0.2);
  const userSmoothingFactorRef = useRef(0.35);

  /**
   * Detect user volume from local participant.
   * Attempts to access audio level from participant properties.
   */
  const detectUserAudioLevel = useCallback((): number => {
    if (!localParticipant) return 0;

    // Try to access audioLevel property if available
    if ('audioLevel' in localParticipant) {
      const level = (localParticipant as any).audioLevel as number | undefined;
      if (level !== undefined && level > 0) {
        // Normalize and amplify (similar to web version)
        const normalized = Math.min(1, level);
        const amplified = Math.pow(normalized, 0.8) * 2.2; // User amplification factor
        return Math.min(1, amplified);
      }
    }

    // Fallback: use isSpeaking state if available
    if ('isSpeaking' in localParticipant) {
      const isSpeaking = (localParticipant as any).isSpeaking as boolean;
      return isSpeaking ? 0.3 : 0; // Simple binary indicator
    }

    return 0;
  }, [localParticipant]);

  /**
   * Detect agent volume from remote participant.
   * Attempts to access audio level from participant properties.
   */
  const detectAgentAudioLevel = useCallback((): number => {
    if (remoteParticipants.length === 0) return 0;

    // Get the first remote participant (typically the agent)
    const agentParticipant = remoteParticipants[0];
    if (!agentParticipant) return 0;

    // Try to access audioLevel property if available
    if ('audioLevel' in agentParticipant) {
      const level = (agentParticipant as any).audioLevel as number | undefined;
      if (level !== undefined && level > 0) {
        // Normalize and amplify (agent gets higher amplification)
        const normalized = Math.min(1, level);
        const amplified = Math.pow(normalized, 0.7) * 3.5; // Agent amplification factor
        return Math.min(1, amplified);
      }
    }

    // Fallback: use isSpeaking state if available
    if ('isSpeaking' in agentParticipant) {
      const isSpeaking = (agentParticipant as any).isSpeaking as boolean;
      return isSpeaking ? 0.5 : 0; // Stronger indication for agent
    }

    return 0;
  }, [remoteParticipants]);

  /**
   * Apply exponential moving average smoothing.
   */
  const applySmoothing = useCallback((
    current: number,
    previous: number,
    factor: number
  ): number => {
    return previous * (1 - factor) + current * factor;
  }, []);

  /**
   * Update audio levels on interval.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Detect raw audio levels
      const rawUserLevel = detectUserAudioLevel();
      const rawAgentLevel = detectAgentAudioLevel();

      // Apply smoothing
      const smoothedUserLevel = applySmoothing(
        rawUserLevel,
        prevUserVolumeRef.current,
        userSmoothingFactorRef.current
      );
      const smoothedAgentLevel = applySmoothing(
        rawAgentLevel,
        prevAgentVolumeRef.current,
        smoothingFactorRef.current
      );

      // Store for next iteration
      prevUserVolumeRef.current = smoothedUserLevel;
      prevAgentVolumeRef.current = smoothedAgentLevel;

      // Call callbacks
      if (onUserVolumeStrength) onUserVolumeStrength(smoothedUserLevel);
      if (onAgentVolumeStrength) onAgentVolumeStrength(smoothedAgentLevel);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [
    localParticipant,
    remoteParticipants,
    detectUserAudioLevel,
    detectAgentAudioLevel,
    applySmoothing,
    onUserVolumeStrength,
    onAgentVolumeStrength,
    updateInterval,
  ]);

  // This component doesn't render anything, it just manages audio level detection
  return null;
}

/**
 * FUTURE ENHANCEMENT:
 * 
 * For more advanced audio visualization comparable to the web version,
 * implement one of the following approaches:
 * 
 * 1. RTCStats-based approach:
 *    - Access WebRTC statistics from peer connection
 *    - Use inboundRtpStream.audioLevel (0-32767)
 *    - Use inboundRtpStream.totalAudioEnergy for RMS calculation
 * 
 * 2. Custom Audio Processing Module:
 *    - Use expo-audio or similar library to access raw audio data
 *    - Process with Web Audio API equivalent
 *    - Detect frequency bins for vocal frequency emphasis
 * 
 * 3. LiveKit Agent Integration:
 *    - Have the Python agent send audio metrics back to client
 *    - Use WebSocket or custom messages to transmit volume data
 */
