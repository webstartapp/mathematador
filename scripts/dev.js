const { concurrently } = require("concurrently");

// Each workspace loads its own env independently (server via dotenv in
// knexWrapper.ts, the app via Expo's built-in .env support) - see
// server/.env.example and mathematador-app/.env.example. This script is
// just orchestration: run both dev servers with a single command.
const { result } = concurrently(
  [
    {
      command: "npm run dev --workspace=server",
      name: "server",
      prefixColor: "blue",
    },
    {
      command: "npm run start --workspace=mathematador-app",
      name: "app",
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
