import "module-alias/register";
require("ts-node/register");
require("tsconfig-paths/register");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

module.exports = require("@/knexWrapper").configKnex;

export {};
