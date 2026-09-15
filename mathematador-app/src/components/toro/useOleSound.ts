import { useAudioPlayer } from "expo-audio";
import { useCallback } from "react";
import { useSelector } from "react-redux";

import oleSoundAsset from "@/assets/sounds/ole.wav";
import { RootState } from "@/redux/store";

export const useOleSound = (): (() => void) => {
  const player = useAudioPlayer(oleSoundAsset);
  const soundEnabled = useSelector(
    (state: RootState) => state.user.soundEnabled,
  );

  const playOleSound = useCallback((): void => {
    // Explicit === false (not a falsy check): a device that already had
    // app data persisted before soundEnabled existed rehydrates with this
    // field simply absent (redux-persist replaces the whole slice object
    // rather than merging in new fields), which is `undefined` at runtime
    // despite the type - that should behave as the intended default
    // (enabled), not as silently muted.
    if (soundEnabled === false) return;
    player.seekTo(0);
    player.play();
  }, [player, soundEnabled]);

  return playOleSound;
};
