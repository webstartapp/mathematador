import { useAudioPlayer } from "expo-audio";

import oleSoundAsset from "@/assets/sounds/ole.wav";

export const useOleSound = (): (() => void) => {
  const player = useAudioPlayer(oleSoundAsset);

  const playOleSound = (): void => {
    player.seekTo(0);
    player.play();
  };

  return playOleSound;
};
