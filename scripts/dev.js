const { concurrently } = require("concurrently");
const fs = require("fs");
const path = require("path");

// Load .env file from root
const envPath = path.join(__dirname, "../.env");
const loadedEnv = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        loadedEnv[key] = value;
        process.env[key] = value;
      }
    }
  });
}

const port = loadedEnv.PORT || "4071";
const expoPort = loadedEnv.EXPO_PORT || "4070";

// Set environment variables for subprojects
process.env.PORT = port;
process.env.EXPO_PORT = expoPort;
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = "1";

// Expo uses PORT environment variable or --port option. We'll use both.
const { result } = concurrently(
  [
    {
      command: "npm run dev --workspace=server",
      name: "server",
      env: { ...process.env, PORT: port },
      prefixColor: "blue",
    },
    {
      command: `npm run start --workspace=mathematador -- --port ${expoPort}`,
      name: "app",
      env: { ...process.env, PORT: expoPort },
      prefixColor: "green",
    },
  ],
  {
    prefix: "name",
    killOthers: ["failure", "success"],
    restartTries: 0,
  },
);

result.then(
  () => process.exit(0),
  () => process.exit(1),
);
