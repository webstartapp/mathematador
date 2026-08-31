const { spawn } = require("child_process");
const path = require("path");

// Each workspace loads its own env independently (server via dotenv in
// knexWrapper.ts, the app via Expo's built-in .env support) - see
// server/.env.example and mathematador-app/.env.example.
//
// The backend runs in the background with its output prefixed and piped
// (it has no interactive UI of its own). Expo runs in the foreground with
// stdio: "inherit" so it gets the real terminal directly - this is required
// for its QR code and interactive dev menu to render at all. A tool like
// `concurrently` pipes every child's stdio through itself for uniform log
// prefixing, which makes Expo detect a non-interactive terminal and
// silently skip that UI; only one process can own the real TTY at a time,
// so the backend has to be the one that gives it up.
const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

// On Windows, npm resolves to npm.cmd, which node can only spawn through a
// shell - passed as one joined string (rather than shell:true + an args
// array) since Node deprecated that combination as argument-escaping-unsafe.
const spawnNpm = (npmArgs, spawnOptions) => {
  if (isWindows) {
    return spawn(["npm", ...npmArgs].join(" "), {
      ...spawnOptions,
      shell: true,
    });
  }
  return spawn("npm", npmArgs, spawnOptions);
};

const serverProcess = spawnNpm(["run", "dev", "--workspace=server"], {
  cwd: rootDir,
  stdio: ["ignore", "pipe", "pipe"],
});

serverProcess.stdout.on("data", (chunk) => {
  process.stdout.write(`[server] ${chunk}`);
});
serverProcess.stderr.on("data", (chunk) => {
  process.stderr.write(`[server] ${chunk}`);
});

let shuttingDown = false;

const shutdown = (exitCode) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  serverProcess.kill();
  process.exit(exitCode);
};

serverProcess.on("exit", (exitCode) => {
  if (!shuttingDown) {
    console.error(
      `[dev] Backend server exited unexpectedly (code ${exitCode}).`,
    );
    shutdown(exitCode ?? 1);
  }
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const expoProcess = spawnNpm(["run", "start", "--workspace=mathematador-app"], {
  cwd: rootDir,
  stdio: "inherit",
});

expoProcess.on("exit", (exitCode) => {
  shutdown(exitCode ?? 0);
});
