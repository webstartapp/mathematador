// Tracks whether the intro video has already played once during this app
// session (tab load) - deliberately a plain module variable, not persisted
// Redux state: GameStack and AuthStack are two separate navigators swapped
// in app/index.tsx based on auth state, so each mounts fresh and would
// otherwise always restart from its own "Intro" initialRouteName, replaying
// the video right after a successful sign-in even though AuthStack's own
// Intro screen just showed it.
let hasPlayedIntroThisSession = false;

export const markIntroPlayed = (): void => {
  hasPlayedIntroThisSession = true;
};

export const hasIntroAlreadyPlayed = (): boolean => hasPlayedIntroThisSession;
