import { defineConfig } from "orval";

const config = defineConfig({
  app: {
    input: "./analytics/_swaggers/be_fe.yaml",
    output: {
      mode: "split",
      target: "./mathematador-app/src/_generated/api.ts",
      schemas: "./mathematador-app/src/_generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "./mathematador-app/src/utils/api-client.ts",
          name: "customInstance",
        },
      },
    },
  },
  serverZod: {
    input: "./analytics/_swaggers/be_fe.yaml",
    output: {
      mode: "split",
      target: "./server/src/_generated/api.ts",
      schemas: "./server/src/_generated/model",
      client: "zod",
    },
  },
  serverAPI: {
    input: "./analytics/_swaggers/be_fe.yaml",
    output: {
      mode: "split",
      target: "./server/src/_generated/serverAPI.ts",
      schemas: "./server/src/_generated/model",
      client: "fetch",
      override: {
        useTypeOverInterfaces: true,
      },
    },
  },
});

export default config;
