import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";

import menuThemeAsset from "@/assets/music/menu-theme.mp3";
import { RootState } from "@/redux/store";

interface MenuMusicControls {
  start: () => void;
  stop: () => void;
}

// Browsers block audio autoplay until the page has seen a user gesture, so a
// bare play() call on mount is silently ignored on a cold load. Retrying on
// the first interaction (any click/tap/keypress) is the standard workaround.
const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart"];

export const useMenuMusic = (): MenuMusicControls => {
  const musicEnabled = useSelector(
    (state: RootState) => state.user.musicEnabled,
  );
  const player = useAudioPlayer(menuThemeAsset);
  const wantsToPlayRef = useRef(false);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  const start = useCallback((): void => {
    if (!musicEnabled) return;
    wantsToPlayRef.current = true;
    player.seekTo(0);
    player.play();
  }, [musicEnabled, player]);

  const stop = useCallback((): void => {
    wantsToPlayRef.current = false;
    player.pause();
  }, [player]);

  useEffect(() => {
    if (Platform.OS !== "web") return () => {};

    const retryOnInteraction = (): void => {
      if (wantsToPlayRef.current && player.paused) {
        player.play();
      }
    };

    FIRST_INTERACTION_EVENTS.forEach((eventName) =>
      document.addEventListener(eventName, retryOnInteraction),
    );
    return () => {
      FIRST_INTERACTION_EVENTS.forEach((eventName) =>
        document.removeEventListener(eventName, retryOnInteraction),
      );
    };
  }, [player]);

  return { start, stop };
};
