#!/usr/bin/env node

// Wraps `expo start` (in whichever mode - start/android/ios/web - is passed
// through as argv) to conditionally add NODE_OPTIONS=--use-system-ca: on a
// machine whose network does TLS-inspecting interception (corporate
// laptops/VPNs), Expo Go's manifest request fails outbound HTTPS
// verification unless Node also trusts the OS's own certificate store (see
// root CLAUDE.md's "Dev commands" section for the full story). That flag
// only exists on Node 23.8+ though - unconditionally passing it via
// `cross-env` in package.json crashed every dev script outright
// ("--use-system-ca is not allowed in NODE_OPTIONS") on any older Node,
// including this repo's own CI image (pinned to Node 22). Checking the
// running Node's version first and only adding the flag when it's actually
// supported keeps the fix effective without making it a hard requirement.

const { spawnSync } = require("child_process");

const SYSTEM_CA_MIN_MAJOR = 23;
const SYSTEM_CA_MIN_MINOR = 8;

const supportsUseSystemCa = () => {
  const [major, minor] = process.versions.node.split(".").map(Number);
  return (
    major > SYSTEM_CA_MIN_MAJOR ||
    (major === SYSTEM_CA_MIN_MAJOR && minor >= SYSTEM_CA_MIN_MINOR)
  );
};

const extraNodeOptions = supportsUseSystemCa() ? "--use-system-ca" : "";

const childEnv = {
  ...process.env,
  NODE_OPTIONS: [process.env.NODE_OPTIONS, extraNodeOptions]
    .filter(Boolean)
    .join(" "),
};

const expoArgs = ["start", ...process.argv.slice(2)];
const result = spawnSync("expo", expoArgs, {
  stdio: "inherit",
  env: childEnv,
  shell: true,
});

process.exit(result.status ?? 1);
