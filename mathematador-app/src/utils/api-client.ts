import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";
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

const PERSISTED_TOKEN_KEY = "auth_token";

const getAuthToken = async (
  viewerId?: string | number,
): Promise<string | null> => {
  if (!viewerId) {
    await AsyncStorage.removeItem(PERSISTED_TOKEN_KEY);
    return null;
  }
  return AsyncStorage.getItem(PERSISTED_TOKEN_KEY);
};

export type CustomRequestConfig = AxiosRequestConfig & {
  body?: string | object | number | boolean | null;
  headers?: Record<string, string | number | boolean | undefined>;
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

const ResponseHeadersSchema = z.record(z.string());

const buildHeaders = (
  configHeaders:
    | Record<string, string | number | boolean | undefined>
    | undefined,
  token: string | null,
): Record<string, string> => {
  const headers: Record<string, string> = {};

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

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const customInstance = async <T>(
  requestUrl: string,
  config: CustomRequestConfig,
): Promise<T> => {
  const viewerId = await getPersistedViewerId();
  const token = await getAuthToken(viewerId);
  const headers = buildHeaders(config.headers, token);

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

  // Extract and persist the authorization token if returned from login/register
  if (
    requestUrl.includes("/user/login") ||
    requestUrl.includes("/user/register")
  ) {
    const parsedHeaders = ResponseHeadersSchema.safeParse(response.headers);
    if (parsedHeaders.success) {
      const authHeader =
        parsedHeaders.data["authorization"] ??
        parsedHeaders.data["Authorization"];

      if (authHeader) {
        const parts = authHeader.split(" ");
        const tokenVal = parts.length === 2 ? parts[1] : parts[0];
        if (tokenVal) {
          await AsyncStorage.setItem(PERSISTED_TOKEN_KEY, tokenVal);
        }
      }
    }
  }

  return response.data;
};
