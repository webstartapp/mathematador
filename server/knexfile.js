const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const buildPath = path.join(__dirname, "build/knexWrapper.js");

if (fs.existsSync(buildPath)) {
  // Running in production or with compiled files
  const { configKnex } = require("./build/knexWrapper");
  module.exports = configKnex();
} else {
  // Running in development without built files; register TypeScript on the fly
  try {
    require("ts-node/register");
    require("tsconfig-paths/register");
  } catch {
    throw new Error(
      "Development dependencies (ts-node, tsconfig-paths) not found. " +
        "If you are running in production, please make sure the project has been built first (npm run build) so the compiled files exist in 'build/'."
    );
  }
  const { configKnex: configKnexDev } = require("./src/knexWrapper");
  module.exports = configKnexDev();
}
