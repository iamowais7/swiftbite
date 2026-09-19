import { useCallback } from "react";

export type SoundName =
  | "new-order"
  | "order-accepted"
  | "order-delivered"
  | "add-to-cart"
  | "error-alert";

// Module-level audio cache — shared across all hook instances
const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

const getAudio = (name: SoundName): HTMLAudioElement => {
  if (!cache[name]) {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.preload = "auto";
    cache[name] = audio;
  }
  return cache[name]!;
};

export const useSound = () => {
  const play = useCallback((name: SoundName, volume = 0.7) => {
    try {
      const audio = getAudio(name);
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browser autoplay policy blocked it — silently ignore
      });
    } catch {
      // ignore any errors
    }
  }, []);

  const stop = useCallback((name: SoundName) => {
    try {
      const audio = getAudio(name);
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // ignore
    }
  }, []);

  return { play, stop };
};
