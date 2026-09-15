// Both of these come from inside dependencies, not this app's own code, and
// can't be fixed without patching them:
// - react-native-paper's ProgressBar (used in Header.tsx) unconditionally
//   requests useNativeDriver internally on several of its own animations,
//   which react-native-web doesn't support.
// - react-native-web's own TouchableOpacity (used throughout this app)
//   passes `pointerEvents` as a direct prop rather than via `style` when
//   `disabled` is set - that's react-native-web's own implementation
//   (node_modules/react-native-web/dist/exports/TouchableOpacity/index.js),
//   not anything this app's code does.
// LogBox.ignoreLogs doesn't catch either on web (verified live - still
// printed after LogBox.ignoreLogs is called), so this filters console.warn
// directly instead.
const KNOWN_THIRD_PARTY_WARNINGS = [
  "useNativeDriver` is not supported because the native animated module is missing",
  "props.pointerEvents is deprecated. Use style.pointerEvents",
];

// Both expo-audio's and expo-video's web players call the underlying
// <audio>/<video> element's own play() directly without awaiting or
// catching its returned promise (node_modules/expo-audio/build/
// AudioPlayer.web.js, node_modules/expo-video/build/VideoPlayer.web.js) -
// there's no promise reference in this app's own code (menuMusicEngine.ts,
// IntroScreen.tsx) to attach a .catch() to. Two distinct browser rejections
// come out of that same gap: NotAllowedError when audio autoplay is
// blocked pre-interaction, and AbortError when the browser's power-saving
// policy interrupts a video-only autoplay. Nothing is actually broken by
// either: menuMusicEngine.ts already treats "requested but not yet
// playing" as expected and retries once the user interacts, and
// IntroScreen.tsx's own statusChange listener reacts to the player's real
// state rather than this promise - both are web-only console noise for an
// expected condition, not a real error.
// Duck-typed name/message string checks, not `instanceof Error`: both
// rejections are actually DOMException instances (the standard type for
// media-element errors), and DOMException deliberately does not inherit
// from Error in browser implementations - an `instanceof Error` guard here
// silently never matches either one, which is exactly what let this
// specific rejection keep appearing live even after this filter shipped.
const isBenignAutoplayRejection = (
  rejectionName: string,
  rejectionMessage: string,
): boolean =>
  (rejectionName === "NotAllowedError" &&
    rejectionMessage.includes("interact with the document first")) ||
  (rejectionName === "AbortError" &&
    rejectionMessage.includes("paused to save power"));

export const silenceKnownUnhandledRejections = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  // globalThis, not window directly - this repo's lint config bans direct
  // `window.*` member access (aimed at things like window.alert/confirm,
  // which have a cross-platform custom-component equivalent); on web,
  // globalThis is the same object and carries the same DOM event target
  // API, with no such equivalent existing for unhandledrejection.
  globalThis.addEventListener("unhandledrejection", (event) => {
    // event.reason is typed `any` by lib.dom.d.ts - member access on it
    // stays `any` too, which is what lets the two typeof checks below
    // narrow rejectionName/rejectionMessage to `string` without needing an
    // intermediate `unknown` (banned in this repo) or an `as` assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rejectionName = event.reason?.name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rejectionMessage = event.reason?.message;
    if (
      typeof rejectionName === "string" &&
      typeof rejectionMessage === "string" &&
      isBenignAutoplayRejection(rejectionName, rejectionMessage)
    ) {
      event.preventDefault();
    }
  });
};

export const silenceThirdPartyWarnings = (): void => {
  // eslint-disable-next-line no-console
  const originalConsoleWarn = console.warn;

  // eslint-disable-next-line no-console
  console.warn = (...warnArgs: Parameters<typeof console.warn>): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [firstArg] = warnArgs;
    const isKnownWarning =
      typeof firstArg === "string" &&
      KNOWN_THIRD_PARTY_WARNINGS.some((pattern) => firstArg.includes(pattern));

    if (isKnownWarning) {
      return;
    }
    originalConsoleWarn(...warnArgs);
  };
};
