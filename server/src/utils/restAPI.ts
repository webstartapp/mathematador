import { Request, Response } from "express";
import * as zod from "zod";

import type { IRestAPI, RestResponse } from "@/utils/apiProxy";

type TopType = {} | null | undefined;

type GetParameters<T> = T extends (...args: infer Args) => infer _R ? (Args extends TopType[] ? Args : []) : [];

type ExtractBody<T extends TopType[]> = T extends [infer First, ...infer Rest]
  ? First extends RequestInit | undefined
    ? void // Found options, no body found before it
    : First extends object
      ? First // Found a data object (Body or Query!)
      : Rest extends TopType[]
        ? ExtractBody<Rest>
        : void
  : void;

export type ApiErrorResponse = { message: string };

type ApiRequest<API extends keyof IRestAPI, PATH extends keyof IRestAPI[API]> = Request<
  Record<string, string>, // Route params
  RestResponse<API, PATH> | ApiErrorResponse, // Response type
  ExtractBody<GetParameters<IRestAPI[API][PATH]>>, // Body Type
  Record<string, string | string[]> // Query
>;

export const restAPICall = <API extends keyof IRestAPI, PATH extends keyof IRestAPI[API]>(
  apiName: API,
  path: PATH,
  resolver: (
    request: ApiRequest<API, PATH>,
    response: Response<RestResponse<API, PATH> | ApiErrorResponse>
  ) => Promise<void> | void,
  config?: {
    params?: zod.ZodType<Record<string, string>, zod.ZodTypeDef, Record<string, string>>;
    body?: zod.ZodType<
      ExtractBody<GetParameters<IRestAPI[API][PATH]>>,
      zod.ZodTypeDef,
      ExtractBody<GetParameters<IRestAPI[API][PATH]>>
    >;
  }
) => {
  return async (request: ApiRequest<API, PATH>, response: Response<RestResponse<API, PATH> | ApiErrorResponse>) => {
    try {
      if (config) {
        if (config.params) {
          const parsedParams = config.params.safeParse(request.params);
          if (!parsedParams.success) {
            response.status(400).json({ message: `Invalid parameters: ${parsedParams.error.message}` });
            return;
          }
          request.params = parsedParams.data;
        }
        if (config.body) {
          const parsedBody = config.body.safeParse(request.body);
          if (!parsedBody.success) {
            response.status(400).json({ message: `Invalid request body: ${parsedBody.error.message}` });
            return;
          }
          request.body = parsedBody.data;
        }
      }
      await resolver(request, response);
    } catch (caughtError) {
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      // eslint-disable-next-line no-console
      console.error(`[REST API Error] ${apiName}.${String(path)}`, error);
      response.status(500).json({ message: "Internal Server Error" });
    }
  };
};
