/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/explicit-function-return-type, no-console */
import * as dotenv from "dotenv";
import { knex as knexHandler, Knex } from "knex";

import { IDBType } from "@/types/KnexDBType";

dotenv.config({ path: ".env" });

export const isItProductionDB = () => {
  return process.env.DATABASE === "production";
};
export const unwrappDBJSON = <DATA extends Record<string, any> | Record<string, any>[]>(
  data: DATA,
  properties: (DATA extends Array<infer T> ? keyof T : keyof DATA)[]
): DATA => {
  if (Array.isArray(data)) {
    return data.map((dataItem) => unwrappDBJSON(dataItem, properties)) as DATA;
  }
  const result = { ...data };
  properties.forEach((prop) => {
    console.log(prop, result[prop], typeof result[prop]);
    if (typeof result[prop] === "string") {
      try {
        result[prop] = JSON.parse(result[prop]);
      } catch (error) {
        result[prop] = [] as never;
        console.log(51, error);
        return;
      }
    }
  });
  return result;
};

export const configKnex: (params?: { followerDB?: boolean }) => Knex.Config = (_params) => ({
  client: "pg",
  connection: {
    connectionString: isItProductionDB() ? process.env.DATABASE_URL : process.env.STAGE_DATABASE_URL,
    ssl:
      process.env.NO_DATABASE_SSL === "yes"
        ? undefined
        : {
            // otherwise it returns: UnhandledPromiseRejectionWarning: Error: self signed certificate
            rejectUnauthorized: false
          }
  },
  migrations: {
    directory: "./src/migrations"
  },
  pool: {
    min: 0,
    max: process.env.ENVIRONMENT === "local" ? 20 : 400
  }
});

const knexWrapper = knexHandler(configKnex());

const knex = <T extends keyof IDBType>(dbName: T) => knexWrapper<IDBType[T], IDBType[T][]>(dbName);
export default knex;
