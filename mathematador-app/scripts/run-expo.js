#!/usr/bin/env node

// Wraps `expo start` (in whichever mode - start/android/ios/web - is passed
// through as argv) to conditionally add NODE_OPTIONS=--use-system-ca: on a
// machine whose network does TLS-inspecting interception (corporate
// laptops/VPNs), Expo Go's manifest request fails outbound HTTPS
// verification unless Node also trusts the OS's own certificate store (see
// root CLAUDE.md's "Dev commands" section for the full story). That flag
// isn't available on every Node version though - unconditionally passing it
// via `cross-env` in package.json crashed every dev script outright
// ("--use-system-ca is not allowed in NODE_OPTIONS") on any Node build that
// doesn't recognize it, including this repo's own CI image (pinned to Node
// 22). Checking `allowedNodeEnvironmentFlags` asks the running Node binary
// directly whether it accepts this flag via NODE_OPTIONS, rather than
// guessing from a hardcoded version threshold that could be wrong for a
// given Node build/platform.

const spawn = require("cross-spawn");

const supportsUseSystemCa = () =>
  process.allowedNodeEnvironmentFlags.has("--use-system-ca");

const extraNodeOptions = supportsUseSystemCa() ? "--use-system-ca" : "";

const childEnv = {
  ...process.env,
  NODE_OPTIONS: [process.env.NODE_OPTIONS, extraNodeOptions]
    .filter(Boolean)
    .join(" "),
};

// cross-spawn resolves Windows' .cmd shims itself, so this never needs
// `shell: true` (and the shell-metacharacter/argument-splitting risk that
// comes with combining that with a raw args array).
const expoArgs = ["start", ...process.argv.slice(2)];
const result = spawn.sync("expo", expoArgs, {
  stdio: "inherit",
  env: childEnv,
});

process.exit(result.status ?? 1);
