/// <reference path="./declaration.d.ts" />
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import router from "@/routes";

const appServer = express();
appServer.use(
  cors({
    exposedHeaders: ["Authorization"]
  })
);
appServer.use(bodyParser.urlencoded({ extended: true }));
appServer.use(bodyParser.json({ limit: "100mb" }));

let portNumber = process.env.PORT ? parseInt(process.env.PORT, 10) : 4021;
const argsList = process.argv.slice(2);

argsList.forEach((argItem, index) => {
  if (argItem === "--port" && argsList[index + 1]) {
    const nextArg = argsList[index + 1];
    if (nextArg) {
      portNumber = parseInt(nextArg, 10);
    }
  }
});

appServer.use(router);

appServer.listen(portNumber, () => {
  // eslint-disable-next-line no-console
  console.log("listening on port " + String(portNumber));
});
