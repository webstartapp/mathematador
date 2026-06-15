import {
  readdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "fs";
import { join } from "path";

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

const configServerZodModels = Object.fromEntries(
  schemaConfigs.map<[string, OptionsExport]>((schemaConfig) => [
    `${schemaConfig.name}_ServerZodModels`,
    {
      input: schemaConfig.input,
      hooks: {
        afterAllFilesWrite: () => {
          const zodsDir = `./server/src/_generated/${schemaConfig.name}_tmp`;
          if (!existsSync(zodsDir)) return;
          const zods = readdirSync(zodsDir);
          const content: string[] = [];
          zods.forEach((zodFile, index) => {
            const zodContent = readFileSync(join(zodsDir, zodFile), "utf-8");
            if (index !== 0) {
              const removedZodImport = zodContent.replace(/import.*/g, "");
              content.push(removedZodImport);
              return;
            }
            content.push(zodContent);
          });
          const schema = content.join("\n");
          const cleanExports = schema.replace(/export \*.*/g, "");
          const removeTypeExports = cleanExports
            .replace(/export type /g, "type ")
            .replace(/zod\.email\(\)/g, "zod.string().email()")
            .replace(/zod\.uuid\(\)/g, "zod.string().uuid()");
          rmSync(zodsDir, { recursive: true, force: true });
          writeFileSync(
            `./server/src/_generated/${schemaConfig.name}.zod.ts`,
            removeTypeExports,
          );
          writeFileSync(
            `./mathematador-app/src/_generated/${schemaConfig.name}.zod.ts`,
            removeTypeExports,
          );
        },
      },
      output: {
        mode: "single",
        target: `./server/src/_generated/${schemaConfig.name}.zod.ts`,
        client: "fetch",
        prettier: true,
        clean: false,
        schemas: {
          type: "zod",
          path: `./server/src/_generated/${schemaConfig.name}_tmp`,
        },
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
  ...configServerZodModels,
  ...configServerAPI,
});

export default config;
