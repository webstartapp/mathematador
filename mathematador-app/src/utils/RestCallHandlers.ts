/* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/explicit-function-return-type, complexity, @typescript-eslint/no-unsafe-argument */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import jwtLib from "expo-jwt";

import { ITokenBody } from "@/_generated/sessionOperations";
import { RESTRequestType } from "@/types/RestAPIGenerator/RESTRequestType";
import { errorObject } from "@/utils/wrapRestCalls";

const PERSISTED_STATE_KEY = "persistedStateRestApi";

const getAuthToken = (viewerId?: number): string | null => {
  const secret = process.env.EXPO_PUBLIC_JWT_SECRET;
  if (!secret || !viewerId) {
    return null;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenBody: ITokenBody = {
    userId: viewerId,
    exp: currentTime + 3600,
    iat: currentTime,
  };
  return jwtLib.encode(tokenBody, secret);
};

export const restInnerCall = async (
  requestContext: Partial<RESTRequestType>,
  axiosAPI: AxiosInstance,
) => {
  const request = {
    ...requestContext,
    headers: {
      "Content-Type": requestContext.requestContentType || "application/json",
      ...requestContext.headers,
    },
  } as Required<AxiosRequestConfig>;

  const storage = await AsyncStorage.getItem(PERSISTED_STATE_KEY);
  const parsedStorage = JSON.parse(storage || "{}");
  const viewerId = parsedStorage?.viewer?.id;

  const token = getAuthToken(viewerId);
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await axiosAPI(request);
    return response;
  } catch (error: any) {
    throw errorObject({
      title: "error.unauthorized",
      message: "error.unauthorized_message",
      APIError: {
        path: requestContext?.url,
        params: requestContext?.params,
        method: requestContext?.method,
        name: requestContext?.name,
        data: Buffer.from(JSON.stringify(requestContext.data || {})).toString(
          "base64",
        ),
        body: error?.response?.data,
        isAxiosError: true,
        code: error.code,
        message: error.message,
        status: error.response?.status,
      },
    });
  }
};
