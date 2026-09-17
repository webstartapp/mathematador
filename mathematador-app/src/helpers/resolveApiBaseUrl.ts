import Constants from "expo-constants";

const FALLBACK_API_URL = String(
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4076",
);

// Only these host shapes are safe to assume are this dev machine's own LAN
// address, reachable on our backend's port too: a plain IPv4 dotted-quad,
// "localhost", or a bracketed IPv6 literal ("[::1]"). @expo/cli's hostUri
// can just as easily be a public tunnel domain (*.exp.direct, ngrok, ...)
// when using `expo start --tunnel`, or a packager-proxy host - neither is
// this machine, so guessing our backend lives there on a different port
// would send every request somewhere that was never listening for them.
const LAN_HOST_PATTERN =
  /^(localhost|\d{1,3}(\.\d{1,3}){3}|\[[0-9a-fA-F:]+\])$/;

// In dev (running via `expo start`), Constants.expoConfig.hostUri is the
// host:port a device already used to fetch the JS bundle from Metro - since
// that connection just worked, the same host reaches the backend too. This
// tracks the dev machine's real LAN IP automatically instead of relying on
// EXPO_PUBLIC_API_URL being hand-updated to match, which is what broke a
// physical Android device reaching a "localhost"-configured backend URL
// (localhost on-device resolves to the device itself, not this machine).
// hostUri is undefined in production and on web (browser and server
// already share a machine there) - only the host is taken from it, since
// its port is Metro's own bundler port, not the backend server's.
const resolveDevHost = (hostUri: string): string | undefined => {
  if (hostUri.startsWith("[")) {
    // Bracketed IPv6 - split at the closing bracket, not the last colon:
    // the address's own colons would otherwise be misread as the
    // host/port separator.
    const closingBracketIndex = hostUri.indexOf("]");
    return closingBracketIndex === -1
      ? undefined
      : hostUri.slice(0, closingBracketIndex + 1);
  }
  const lastColonIndex = hostUri.lastIndexOf(":");
  const candidate =
    lastColonIndex === -1 ? hostUri : hostUri.slice(0, lastColonIndex);
  // A leftover colon means this was actually an unbracketed raw IPv6
  // address (@expo/cli doesn't bracket one), not a plain host:port pair -
  // there's no reliable way to tell where the address ends and the port
  // begins, so this is treated as unparseable rather than guessed at.
  return candidate.includes(":") ? undefined : candidate;
};

export const resolveApiBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri ? resolveDevHost(hostUri) : undefined;
  if (!devHost || !LAN_HOST_PATTERN.test(devHost)) {
    return FALLBACK_API_URL;
  }
  const apiPortMatch = /:(\d+)(?:\/|$)/.exec(FALLBACK_API_URL);
  if (!apiPortMatch) {
    // No silent guessed port: EXPO_PUBLIC_API_URL is the one source of
    // truth for the backend's port, so a hardcoded fallback would
    // silently misroute every request instead of surfacing this.
    throw new Error(
      `EXPO_PUBLIC_API_URL ("${FALLBACK_API_URL}") has no explicit port.`,
    );
  }
  return `http://${devHost}:${apiPortMatch[1]}`;
};
