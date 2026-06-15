import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";
import jwtLib from "expo-jwt";
import { z } from "zod";

const AXIOS_INSTANCE = axios.create({
  baseURL: String(process.env.EXPO_PUBLIC_API_URL || "http://localhost:4076"),
});

const PERSISTED_STATE_KEY = "persist:root";

const PersistedStateSchema = z.object({
  user: z.string().optional(),
});

const UserStateSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  viewer: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
});

const getAuthToken = (viewerId?: string | number): string | null => {
  const secret = String(process.env.EXPO_PUBLIC_JWT_SECRET || "");
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

export type CustomRequestConfig = AxiosRequestConfig & {
  body?: string | object | number | boolean | null;
};

const JsonValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.record(z.any()),
  z.array(z.any()),
  z.null(),
]);

const HeadersSchema = z.record(z.union([z.string(), z.number(), z.boolean()]));

const parseJSON = (
  jsonString: string,
): string | object | number | boolean | null => {
  const parsed = JsonValueSchema.safeParse(JSON.parse(jsonString));
  if (parsed.success) {
    return parsed.data;
  }
  return null;
};

const getPersistedViewerId = async (): Promise<string | number | undefined> => {
  try {
    const storage =
      typeof window !== "undefined"
        ? await AsyncStorage.getItem(PERSISTED_STATE_KEY)
        : null;

    if (storage) {
      const rootParsedSafe = PersistedStateSchema.safeParse(
        JSON.parse(storage),
      );
      if (rootParsedSafe.success && rootParsedSafe.data.user) {
        const userParsedSafe = UserStateSchema.safeParse(
          JSON.parse(rootParsedSafe.data.user),
        );
        if (userParsedSafe.success) {
          return userParsedSafe.data.id ?? userParsedSafe.data.viewer?.id;
        }
      }
    }
  } catch {
    // Ignore parsing errors to prevent app crash
  }
  return undefined;
};

export const customInstance = async <T>(
  requestUrl: string,
  config: CustomRequestConfig,
): Promise<T> => {
  const viewerId = await getPersistedViewerId();

  const headers: Record<string, string> = {};

  const configHeaders = config.headers;
  if (configHeaders) {
    const parsedHeaders = HeadersSchema.safeParse(configHeaders);
    if (parsedHeaders.success) {
      Object.keys(parsedHeaders.data).forEach((key) => {
        const value = parsedHeaders.data[key];
        if (value !== undefined) {
          headers[key] = String(value);
        }
      });
    }
  }

  const token = getAuthToken(viewerId);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const { body, ...rest } = config;
  let requestData = body;
  if (typeof body === "string") {
    try {
      requestData = parseJSON(body);
    } catch {
      requestData = body;
    }
  }

  const response = await AXIOS_INSTANCE<T>({
    url: requestUrl,
    data: requestData,
    ...rest,
    headers,
  });
  return response.data;
};
