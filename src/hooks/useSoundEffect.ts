import { useRef, useCallback } from 'react';

interface UseSoundEffectOptions {
  volume?: number;
  loop?: boolean;
}

export const useSoundEffect = (
  _soundUrl: string,
  _options: UseSoundEffectOptions = {}
) => {
  const dummyRef = useRef(false);

  const play = useCallback(() => {
    if (dummyRef.current) return;
  }, []);

  const stop = useCallback(() => {
    dummyRef.current = false;
  }, []);

  const pause = useCallback(() => {
    dummyRef.current = false;
  }, []);

  return { play, stop, pause };
};
