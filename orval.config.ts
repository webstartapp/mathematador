import { defineConfig, OptionsExport } from "orval";

type SchemaConfig = {
  name: string;
  input: string;
};

const schemaConfigs: SchemaConfig[] = [
  {
    name: "be_fe",
    input: "./analytics/_swaggers/be_fe.yaml",
  },
];

const configApp = Object.fromEntries(
  schemaConfigs.map<[string, OptionsExport]>((schemaConfig) => [
    `${schemaConfig.name}_App`,
    {
      input: schemaConfig.input,
      output: {
        mode: "split",
        target: `./mathematador-app/src/_generated/api.ts`,
        schemas: `./mathematador-app/src/_generated/model`,
        client: "react-query",
        prettier: true,
        override: {
          mutator: {
            path: "./mathematador-app/src/utils/api-client.ts",
            name: "customInstance",
          },
        },
      },
    },
  ]),
);

const configServerZod = Object.fromEntries(
  schemaConfigs.map<[string, OptionsExport]>((schemaConfig) => [
    `${schemaConfig.name}_ServerZod`,
    {
      input: schemaConfig.input,
      output: {
        mode: "split",
        target: `./server/src/_generated/api.ts`,
        schemas: `./server/src/_generated/model`,
        client: "zod",
        prettier: true,
      },
    },
  ]),
);

const configServerAPI = Object.fromEntries(
  schemaConfigs.map<[string, OptionsExport]>((schemaConfig) => [
    `${schemaConfig.name}_ServerAPI`,
    {
      input: schemaConfig.input,
      output: {
        mode: "split",
        target: `./server/src/_generated/serverAPI.ts`,
        schemas: `./server/src/_generated/model`,
        client: "fetch",
        prettier: true,
        override: {
          useTypeOverInterfaces: true,
        },
      },
    },
  ]),
);

const config = defineConfig({
  ...configApp,
  ...configServerZod,
  ...configServerAPI,
});

export default config;
