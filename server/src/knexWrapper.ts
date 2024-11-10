// import knexHandler, { Config } from "knex";
import { knex as knexHandler, Knex } from "knex";
import { ExpressResolverType } from "@/resolvers/expressTypeResolver";
import { IDBType } from "@/types/KnexDBType";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

export const isItProductionDB = () => {
  return process.env.DATABASE === "production";
};

export const sanateInsertData = <T extends string>(
  DBModel: ExpressResolverType,
  data: Record<string, any> | Record<string, any>[],
  withDefault: Partial<Record<T, any>> = {}
) => {
  const processedData = Array.isArray(data) ? data : [data];
  return processedData.map((d) => {
    const out: Record<string, any> = {
      ...withDefault
    };
    if (!Object.keys(DBModel.properties || {}).length) {
      throw new Error("DBModel.properties is not defined");
    }
    Object.keys(DBModel.properties || {}).forEach((key) => {
      const property = DBModel.properties[key as keyof typeof DBModel.properties];
      if (Array.isArray(d[property])) {
        out[key] = JSON.stringify(d[property]);
      } else {
        out[key] = d[property] === undefined ? out[key] : d[property];
      }
    });
    return out;
  });
};
export const unwrappDBJSON = <DATA extends Record<string, any> | Record<string, any>[]>(
  data: DATA,
  properties: (DATA extends Array<infer T> ? keyof T : keyof DATA)[]
): DATA => {
  if (Array.isArray(data)) {
    return data.map((d) => unwrappDBJSON(d, properties)) as DATA;
  }
  const out = { ...data };
  properties.forEach((prop) => {
    console.log(prop, out[prop], typeof out[prop]);
    if (typeof out[prop] === "string") {
      try {
        out[prop] = JSON.parse(out[prop]);
      } catch (e) {
        out[prop] = [] as never;
        console.log(51, e);
        return;
      }
    }
  });
  return out;
};

export const configKnex: (p?: { followerDB?: boolean }) => Knex.Config = (p) => ({
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
