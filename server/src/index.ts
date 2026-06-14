/* eslint-disable no-console, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { z as zodSchema } from "zod";

import router from "@/routes";

// Augment zod with email and uuid methods for Orval-generated schemas
(zodSchema as any).email = (params?: any) => zodSchema.string().email(params);
(zodSchema as any).uuid = (params?: any) => zodSchema.string().uuid(params);

const appServer = express();
appServer.use(cors());
appServer.use(bodyParser.urlencoded({ extended: true }));
appServer.use(bodyParser.json({ limit: "100mb" }));

let portNumber = process.env.PORT || 4021;
const argsList = process.argv.slice(2);

argsList.forEach((argItem, index) => {
  if (argItem === "--port" && argsList[index + 1]) {
    portNumber = parseInt(argsList[index + 1], 10);
  }
});

appServer.use(router);

appServer.listen(portNumber, () => {
  console.log("listening on port " + portNumber);
});
