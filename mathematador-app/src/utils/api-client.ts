import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
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

const JsonValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.record(z.any()),
  z.array(z.any()),
  z.null(),
]);

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

const normalizeHeaders = (
  headersInit: HeadersInit | undefined,
): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (!headersInit) {
    return headers;
  }

  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  const entries = Array.isArray(headersInit)
    ? headersInit
    : Object.entries(headersInit);

  entries.forEach(([key, value]) => {
    if (value !== undefined) {
      headers[key] = String(value);
    }
  });

  return headers;
};

const persistAuthTokenIfPresent = async (
  requestUrl: string,
  responseHeaders: AxiosResponse["headers"],
): Promise<void> => {
  const isAuthRequest =
    requestUrl.includes("/user/login") || requestUrl.includes("/user/register");
  if (!isAuthRequest) {
    return;
  }

  const parsedHeaders = ResponseHeadersSchema.safeParse(responseHeaders);
  if (!parsedHeaders.success) {
    return;
  }

  const authHeader =
    parsedHeaders.data["authorization"] ?? parsedHeaders.data["Authorization"];
  if (!authHeader) {
    return;
  }

  const parts = authHeader.split(" ");
  const tokenVal = parts.length === 2 ? parts[1] : parts[0];
  if (tokenVal) {
    await AsyncStorage.setItem(PERSISTED_TOKEN_KEY, tokenVal);
  }
};

// Matches the RequestInit shape orval's fetch-client codegen always passes
// (see @orval/fetch's generated `options?: RequestInit`), translated into
// an axios call under the hood.
export const customInstance = async <T>(
  requestUrl: string,
  options: RequestInit,
): Promise<T> => {
  const viewerId = await getPersistedViewerId();
  const token = await getAuthToken(viewerId);
  const headers = normalizeHeaders(options.headers);

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestBody =
    typeof options.body === "string" ? parseJSON(options.body) : options.body;

  const response = await AXIOS_INSTANCE<T>({
    url: requestUrl,
    method: options.method,
    data: requestBody,
    headers,
    signal: options.signal ?? undefined,
  });

  await persistAuthTokenIfPresent(requestUrl, response.headers);

  return response.data;
};
