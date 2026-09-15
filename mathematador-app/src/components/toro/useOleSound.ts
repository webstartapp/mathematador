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
    if (!soundEnabled) return;
    player.seekTo(0);
    player.play();
  }, [player, soundEnabled]);

  return playOleSound;
};
