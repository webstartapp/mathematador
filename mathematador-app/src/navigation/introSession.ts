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

// Same pattern, for Consent (#31) - set only once the gate is genuinely
// resolved (the user accepted, or ConsentScreen found an existing local
// record and skipped straight past it), never merely because Intro played.
// Without this distinction, following one of ConsentScreen's own policy
// links (e.g. "Privacy Policy") and returning via "Back to game" would
// remount AuthStack/GameStack fresh with hasIntroAlreadyPlayed() still
// true from earlier in the tab session - jumping its initialRouteName
// straight past an unresolved Consent screen and into Auth/Home.
let hasConsentResolvedThisSession = false;

export const markConsentResolved = (): void => {
  hasConsentResolvedThisSession = true;
};

export const hasConsentAlreadyResolvedThisSession = (): boolean =>
  hasConsentResolvedThisSession;

// Shared by AuthStack and GameStack: both gate their real entry route
// (Auth / Home) behind Intro then Consent, and both need the exact same
// "have we already gotten past these this session" precedence to decide
// where a freshly-mounted Stack.Navigator should actually start.
export const resolveGatedInitialRoute = <FinalRouteName extends string>(
  finalRouteName: FinalRouteName,
): "Intro" | "Consent" | FinalRouteName => {
  if (!hasIntroAlreadyPlayed()) {
    return "Intro";
  }
  if (!hasConsentAlreadyResolvedThisSession()) {
    return "Consent";
  }
  return finalRouteName;
};
