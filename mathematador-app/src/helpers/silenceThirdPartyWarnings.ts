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
