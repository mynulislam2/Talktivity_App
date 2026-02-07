/**
 * useCallSoundEffects Hook
 * 
 * Manages sound effects based on agent state.
 * Plays connecting sound when agent state is "connecting" and stops for other states.
 */

import { useEffect } from 'react';
import { AgentState } from '@livekit/components-react';
import { useSoundEffect } from '@/Hooks/useSoundEffect';

export function useCallSoundEffects(agentState: AgentState): void {
  const { play: playConnectingSound, stop: stopConnectingSound } = useSoundEffect(
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    { volume: 0.5, loop: true }
  );

  useEffect(() => {
    if (agentState === "connecting") {
      playConnectingSound();
    } else if (["initializing", "listening", "thinking", "speaking", "disconnected"].includes(agentState)) {
      stopConnectingSound();
    }
  }, [agentState, playConnectingSound, stopConnectingSound]);
}
