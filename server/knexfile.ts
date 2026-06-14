/* eslint-disable no-restricted-imports */
import "module-alias/register";
import "ts-node/register";
import "tsconfig-paths/register";
import * as dotenv from "dotenv";

import { configKnex } from "./src/knexWrapper";

dotenv.config({ path: ".env" });

module.exports = configKnex;

export {};
