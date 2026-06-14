/* eslint-disable-next-line no-restricted-imports */
import * as serverAPI from "../_generated/serverAPI";

const allRestAPIs = {
  mathematador: serverAPI
};

// Extract only functions (API endpoints), ignoring constants like '...Url' strings
type FilterEndpoints<T> = {
  [K in keyof T as T[K] extends (...args: infer _A) => infer _R ? K : never]: T[K];
};

type Endpoints = typeof allRestAPIs;

export type IRestAPI = {
  [K in keyof Endpoints]: FilterEndpoints<Endpoints[K]>;
};

export const RestAPIs: IRestAPI = allRestAPIs;

// --- Type Extraction Magic ---
// Extracts the ReturnType of the fetcher promise, and specifically pulls out the 'data' payload
type ExtractData<T> = T extends { data: infer D } ? D : T;

export type RestResponse<API extends keyof IRestAPI, PATH extends keyof IRestAPI[API]> = IRestAPI[API][PATH] extends (
  ...args: infer _A
) => Promise<infer R>
  ? ExtractData<R>
  : never;
