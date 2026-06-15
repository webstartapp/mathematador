import * as dotenv from "dotenv";
import { knex as knexHandler, Knex } from "knex";

import { IDBType } from "@/types/KnexDBType";

dotenv.config({ path: ".env" });

const isItProductionDB = (): boolean => {
  return process.env.DATABASE === "production";
};

export const configKnex = (): Knex.Config => ({
  client: "pg",
  connection: {
    connectionString: isItProductionDB() ? process.env.DATABASE_URL : process.env.STAGE_DATABASE_URL,
    ssl:
      process.env.NO_DATABASE_SSL === "yes"
        ? undefined
        : {
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

const knex = <T extends keyof IDBType>(dbName: T): Knex.QueryBuilder<IDBType[T], IDBType[T][]> => {
  return knexWrapper<IDBType[T], IDBType[T][]>(dbName);
};

export default knex;
