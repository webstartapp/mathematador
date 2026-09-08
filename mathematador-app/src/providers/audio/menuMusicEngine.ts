import { AudioPlayer, AudioSource, createAudioPlayer } from "expo-audio";

const CROSSFADE_DURATION_MS = 1000;
const FADE_TICK_INTERVAL_MS = 50;
const TARGET_VOLUME = 1;

export interface MenuMusicEngine {
  requestTrack: (source: AudioSource | null) => void;
  retryPlaybackOnInteraction: () => void;
  teardown: () => void;
}

const getTrackKey = (source: AudioSource | null): string | null =>
  source === null ? null : JSON.stringify(source);

const releaseSlot = (player: AudioPlayer): void => {
  try {
    player.remove();
  } catch {
    // Native player may already be gone - nothing left to release.
  }
};

const createSlot = (): AudioPlayer => {
  const player = createAudioPlayer(null);
  player.loop = true;
  player.volume = 0;
  return player;
};

export const createMenuMusicEngine = (): MenuMusicEngine => {
  let slots: [AudioPlayer, AudioPlayer] | null = null;
  let activeSlotIndex: 0 | 1 = 0;
  let currentTrackKey: string | null = null;
  let fadeIntervalId: ReturnType<typeof setInterval> | null = null;

  const ensureSlots = (): [AudioPlayer, AudioPlayer] => {
    if (!slots) {
      slots = [createSlot(), createSlot()];
    }
    return slots;
  };

  const stepToward = (current: number, target: number): number => {
    const step = FADE_TICK_INTERVAL_MS / CROSSFADE_DURATION_MS;
    if (current < target) return Math.min(target, current + step);
    if (current > target) return Math.max(target, current - step);
    return target;
  };

  const tick = (): void => {
    const currentSlots = ensureSlots();
    let allAtTarget = true;

    currentSlots.forEach((player, slotIndex) => {
      const isActive =
        slotIndex === activeSlotIndex && currentTrackKey !== null;

      if (isActive && !player.playing) {
        // Autoplay may have been silently blocked (e.g. no user gesture yet
        // on web) - hold the fade-in until playback genuinely starts, so the
        // crossfade happens relative to when audio is actually audible, not
        // to wall-clock time since the request was made.
        allAtTarget = false;
        return;
      }

      const target = isActive ? TARGET_VOLUME : 0;
      const nextVolume = stepToward(player.volume, target);

      if (nextVolume !== player.volume) {
        player.volume = nextVolume;
      }
      if (nextVolume === 0 && !isActive && player.playing) {
        player.pause();
      }
      if (nextVolume !== target) {
        allAtTarget = false;
      }
    });

    if (allAtTarget && fadeIntervalId !== null) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }
  };

  const beginFade = (): void => {
    if (fadeIntervalId !== null) return;
    fadeIntervalId = setInterval(tick, FADE_TICK_INTERVAL_MS);
  };

  const requestTrack = (source: AudioSource | null): void => {
    const trackKey = getTrackKey(source);
    if (trackKey === currentTrackKey) return;
    currentTrackKey = trackKey;

    const currentSlots = ensureSlots();
    if (source !== null) {
      const incomingIndex: 0 | 1 = activeSlotIndex === 0 ? 1 : 0;
      const incomingPlayer = currentSlots[incomingIndex];
      incomingPlayer.pause();
      incomingPlayer.replace(source);
      incomingPlayer.seekTo(0);
      incomingPlayer.loop = true;
      incomingPlayer.volume = 0;
      incomingPlayer.play();
      activeSlotIndex = incomingIndex;
    }
    beginFade();
  };

  const retryPlaybackOnInteraction = (): void => {
    if (currentTrackKey === null || !slots) return;
    const activePlayer = slots[activeSlotIndex];
    if (activePlayer.paused) {
      activePlayer.play();
      beginFade();
    }
  };

  const teardown = (): void => {
    if (fadeIntervalId !== null) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }
    slots?.forEach(releaseSlot);
    slots = null;
    currentTrackKey = null;
  };

  return { requestTrack, retryPlaybackOnInteraction, teardown };
};
