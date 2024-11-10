import express from "express";
import cors from "cors";
import resolvers from "./resolvers/expressResolver";
import bodyParser from "body-parser";
import { generatedRoutes } from "@/_generated/sessionOperations";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));

let PORT = process.env.PORT || 4021;
const args = process.argv.slice(2);

args.forEach((arg, index) => {
  if (arg === "--port" && args[index + 1]) {
    PORT = parseInt(args[index + 1], 10);
  }
});

const router = resolvers([...generatedRoutes]);

app.use(router);

const server = app.listen(PORT, () => console.log("listening on port " + PORT));
