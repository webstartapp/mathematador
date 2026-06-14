/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "module-alias/register";
import "ts-node/register";
import "tsconfig-paths/register";
import * as dotenv from "dotenv";

import { configKnex } from "@/knexWrapper";

dotenv.config({ path: ".env" });

module.exports = configKnex;

export {};
