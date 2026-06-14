/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwtLib from "expo-jwt";

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4071",
});

const PERSISTED_STATE_KEY = "persistedStateRestApi";

const getAuthToken = (viewerId?: number): string | null => {
  const secret = process.env.EXPO_PUBLIC_JWT_SECRET;
  if (!secret || !viewerId) {
    return null;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenBody = {
    userId: viewerId,
    exp: currentTime + 3600,
    iat: currentTime,
  };
  return jwtLib.encode(tokenBody, secret);
};

export const customInstance = async <T>(
  requestUrl: string,
  config: any,
): Promise<T> => {
  const storage = await AsyncStorage.getItem(PERSISTED_STATE_KEY);
  const parsedStorage = JSON.parse(storage || "{}");
  const viewerId = parsedStorage?.viewer?.id;

  const headers: Record<string, string> = {};

  if (config?.headers) {
    Object.keys(config.headers).forEach((key) => {
      headers[key] = String(config.headers[key]);
    });
  }

  const token = getAuthToken(viewerId);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const { body, ...rest } = config || {};
  let requestData = body;
  if (typeof body === "string") {
    try {
      requestData = JSON.parse(body);
    } catch {
      requestData = body;
    }
  }

  const response = await AXIOS_INSTANCE({
    url: requestUrl,
    data: requestData,
    ...rest,
    headers,
  });
  return response.data;
};
