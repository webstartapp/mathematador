/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, no-restricted-syntax, @typescript-eslint/explicit-function-return-type */
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import {
  APIErrorObject,
  APIRequestCallType,
  ErrorObject,
} from "@/types/RestAPIGenerator/RESTRequestType";
import { restInnerCall } from "@/utils/RestCallHandlers";

export const errorObject = (
  error: ErrorObject | string,
  statusCode?: number,
  APIError?: APIErrorObject,
) => {
  const errorObj: ErrorObject =
    typeof error === "string"
      ? {
          message: error,
        }
      : error;
  if (Array.isArray(errorObj.message)) {
    const newMessage = errorObj.message.join(", ");
    errorObj.message = newMessage;
  }
  errorObj.title = typeof error === "string" ? "error.error" : error.title;
  errorObj.statusCode = statusCode || (error as any)?.statusCode;
  errorObj.APIError = APIError || (error as any)?.APIError;
  errorObj.stack = (error as any)?.stack || new Error().stack;
  return errorObj;
};

type UseCallFNType<
  OPERATIONS extends Record<string, APIRequestCallType>,
  PATH extends keyof OPERATIONS,
> = (
  path: PATH,
  ...params: Parameters<OPERATIONS[PATH]>
) => UseQueryResult<ReturnType<OPERATIONS[PATH]>["responseType"], ErrorObject>;

type UseMutationFNType<
  OPERATIONS extends Record<string, APIRequestCallType>,
  PATH extends keyof OPERATIONS,
> = (
  path: PATH,
  options: UseMutationOptions<any, ErrorObject, any>,
) => UseMutationResult<
  ReturnType<OPERATIONS[PATH]>["responseType"],
  ErrorObject,
  Parameters<OPERATIONS[PATH]>
>;

export const wrapRestCalls = <
  OPERATIONS extends Record<string, APIRequestCallType>,
  PATH extends string extends keyof OPERATIONS ? never : keyof OPERATIONS,
>(
  operations: OPERATIONS,
) => {
  return (baseURL: string) => {
    const axiosAPI = axios.create({
      baseURL,
      paramsSerializer: {
        serialize: (params) => {
          if (params) {
            Object.keys(params).forEach((key) => {
              if (
                params[key] === undefined ||
                (Array.isArray(params[key]) && params[key].length === 0)
              )
                delete params[key];
            });
          }
          return new URLSearchParams(params).toString();
        },
      },
    });
    return (useCallOptions?: UseQueryOptions<any, ErrorObject>) => {
      const useCallInner: UseCallFNType<OPERATIONS, PATH> = (
        path,
        ...params
      ) => {
        return useQuery<any, ErrorObject>({
          queryKey: [path, JSON.stringify(params[0])],
          queryFn: async () => {
            if (!operations[path])
              throw errorObject({
                title: "error.network",
                message: `Path ${path as string} is not defined in API.`,
              });

            const response = await restInnerCall(
              operations[path](...(params as unknown as [any])),
              axiosAPI,
            );
            return response.data;
          },
          staleTime: 1000 * 60 * 15,
          refetchOnWindowFocus: false,
          ...useCallOptions,
        });
      };
      const mutateCall: UseMutationFNType<OPERATIONS, PATH> = (
        path: PATH,
        options: UseMutationOptions<any, ErrorObject, any>,
      ) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useMutation({
          mutationKey: [path as string],
          mutationFn: async (props: any) => {
            const response = await restInnerCall(
              operations[path](...(props as unknown as [any])),
              axiosAPI,
            );
            return response.data;
          },
          ...options,
        });
      };
      const queryClient = useQueryClient();
      return {
        useCall<T extends PATH>(path: T, ...params: Parameters<OPERATIONS[T]>) {
          return useCallInner(path, ...params) as {
            data: ReturnType<OPERATIONS[T]>["responseType"];
            error: ErrorObject;
            isLoading: boolean;
            refetch: () => void;
          };
        },
        invalidateCall<T extends PATH>(paths: T[]) {
          paths.forEach((path) => {
            queryClient.invalidateQueries({ queryKey: [path] });
          });
        },
        useMutation<T extends PATH>(
          path: T,
          options?: UseMutationOptions<any, ErrorObject, any>,
        ) {
          return mutateCall(path, options || {}) as UseMutationResult<
            ReturnType<OPERATIONS[T]>["responseType"],
            ErrorObject,
            Parameters<OPERATIONS[T]>
          >;
        },
      };
    };
  };
};
