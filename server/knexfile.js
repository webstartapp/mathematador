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
  require("ts-node/register");
  require("tsconfig-paths/register");
  const { configKnex } = require("./src/knexWrapper");
  module.exports = configKnex();
}
