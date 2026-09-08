import { useCallback } from "react";
import { useSelector } from "react-redux";

import menuThemeAsset from "@/assets/music/menu-theme.mp3";
import { useMenuMusicContext } from "@/providers/audio/MenuMusicProvider";
import { RootState } from "@/redux/store";

interface MenuMusicControls {
  start: () => void;
  stop: () => void;
}

export const useMenuMusic = (): MenuMusicControls => {
  const musicEnabled = useSelector(
    (state: RootState) => state.user.musicEnabled,
  );
  const { requestTrack } = useMenuMusicContext();

  const start = useCallback((): void => {
    if (!musicEnabled) return;
    requestTrack(menuThemeAsset);
  }, [musicEnabled, requestTrack]);

  const stop = useCallback((): void => {
    requestTrack(null);
  }, [requestTrack]);

  return { start, stop };
};
