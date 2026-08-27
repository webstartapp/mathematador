import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import menuThemeAsset from "@/assets/music/menu-theme.wav";
import { RootState } from "@/redux/store";

interface MenuMusicControls {
  start: () => void;
  stop: () => void;
}

export const useMenuMusic = (): MenuMusicControls => {
  const musicEnabled = useSelector(
    (state: RootState) => state.user.musicEnabled,
  );
  const player = useAudioPlayer(menuThemeAsset);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  const start = useCallback((): void => {
    if (!musicEnabled) return;
    player.seekTo(0);
    player.play();
  }, [musicEnabled, player]);

  const stop = useCallback((): void => {
    player.pause();
  }, [player]);

  return { start, stop };
};
