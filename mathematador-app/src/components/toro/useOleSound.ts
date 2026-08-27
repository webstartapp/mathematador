import { useAudioPlayer } from "expo-audio";
import { useCallback } from "react";

import oleSoundAsset from "@/assets/sounds/ole.wav";

export const useOleSound = (): (() => void) => {
  const player = useAudioPlayer(oleSoundAsset);

  const playOleSound = useCallback((): void => {
    player.seekTo(0);
    player.play();
  }, [player]);

  return playOleSound;
};
