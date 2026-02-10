/**
 * usePracticeSoundEffects Hook
 * 
 * Manages sound effects based on agent state.
 * Plays connecting sound when agent state is "connecting" and stops for other states.
 */

import { useEffect } from 'react';
import { AgentState } from '@livekit/components-react';
import { useSoundEffect, SoundEffect } from '@/hooks/useSoundEffect';

export function usePracticeSoundEffects(agentState: AgentState): void {
  const { playSound, stopSound } = useSoundEffect();

  useEffect(() => {
    if (agentState === 'connecting' || agentState === 'initializing') {
      // Play a notification sound when connecting (if sound files are available)
      // For now, this will silently fail if sound files don't exist
      playSound(SoundEffect.NOTIFICATION).catch(() => {
        // Silently handle missing sound files
      });
    } else {
      stopSound();
    }
  }, [agentState, playSound, stopSound]);
}
