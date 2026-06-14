/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";

import type { IRestAPI, RestResponse } from "@/utils/apiProxy";

type ExtractBody<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends RequestInit | undefined
    ? void // Found options, no body found before it
    : First extends object
      ? First // Found a data object (Body or Query!)
      : ExtractBody<Rest> // Skip strings/numbers (which are path params)
  : void;

export type ApiErrorResponse = { message: string };

type ApiRequest<API extends keyof IRestAPI, PATH extends keyof IRestAPI[API]> = Request<
  Record<string, string>, // Route params
  RestResponse<API, PATH> | ApiErrorResponse, // Response type
  ExtractBody<Parameters<IRestAPI[API][PATH] extends (...args: infer _A) => infer _R ? IRestAPI[API][PATH] : never>>, // Body Type
  Record<string, any> // Query
>;

export const restAPICall = <API extends keyof IRestAPI, PATH extends keyof IRestAPI[API]>(
  apiName: API,
  path: PATH,
  resolver: (
    request: ApiRequest<API, PATH>,
    response: Response<RestResponse<API, PATH> | ApiErrorResponse>
  ) => Promise<void> | void
) => {
  return async (request: ApiRequest<API, PATH>, response: Response<RestResponse<API, PATH> | ApiErrorResponse>) => {
    try {
      await resolver(request, response);
    } catch (caughtError) {
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      console.error(`[REST API Error] ${apiName}.${String(path)}`, error);
      response.status(500).json({ message: error.message });
    }
  };
};
