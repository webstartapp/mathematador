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

// expo-audio's web AudioPlayer.play() calls the underlying <audio> element's
// own play() directly without awaiting or catching its returned promise
// (node_modules/expo-audio/build/AudioPlayer.web.js) - there's no promise
// reference in this app's own code to attach a .catch() to. When the
// browser's autoplay policy blocks it (no user interaction yet), that
// rejection surfaces as an unhandled rejection instead. Nothing is actually
// broken by this: menuMusicEngine.ts already treats "requested but not yet
// playing" as an expected, normal state (see its tick()/
// retryPlaybackOnInteraction) and retries once the user interacts - this is
// web-only console noise for an expected condition, not a real error.
const isBenignAutoplayRejection = (rejectionReason: Error): boolean =>
  rejectionReason.name === "NotAllowedError" &&
  rejectionReason.message.includes("interact with the document first");

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- PromiseRejectionEvent.reason is typed `any` by lib.dom.d.ts
    const rejectionReason = event.reason;
    if (
      rejectionReason instanceof Error &&
      isBenignAutoplayRejection(rejectionReason)
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
