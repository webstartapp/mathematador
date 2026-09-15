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
    // Explicit === false (not a falsy check): a device that already had
    // app data persisted before musicEnabled existed rehydrates with this
    // field simply absent (undefined at runtime despite the boolean type),
    // which should behave as the intended default (enabled) - same fix as
    // useOleSound.ts's playback guard, and what SettingsScreen.tsx's toggle
    // already displays via musicEnabled !== false.
    if (musicEnabled === false) return;
    requestTrack(menuThemeAsset);
  }, [musicEnabled, requestTrack]);

  const stop = useCallback((): void => {
    requestTrack(null);
  }, [requestTrack]);

  return { start, stop };
};
