import axios, { AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JWT from "expo-jwt";

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4071",
});

const PERSISTED_STATE_KEY = "persistedStateRestApi";

export const customInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const storage = await AsyncStorage.getItem(PERSISTED_STATE_KEY);
  const { viewer } = JSON.parse(storage || "{}");

  const headers: Record<string, string> = {};

  if (config.headers) {
    Object.keys(config.headers).forEach((key) => {
      headers[key] = String(config.headers![key]);
    });
  }

  if (process.env.EXPO_PUBLIC_JWT_SECRET && viewer?.id) {
    const tokenBody = {
      userId: viewer.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };
    const token = JWT.encode(tokenBody, process.env.EXPO_PUBLIC_JWT_SECRET);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await AXIOS_INSTANCE({
    ...config,
    headers,
  });
  return response.data;
};
