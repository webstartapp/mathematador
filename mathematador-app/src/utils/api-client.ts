import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

import { logout } from "@/redux/slices/userSlice";
import { store } from "@/redux/store";

// Carries the HTTP status alongside the message so callers (AuthScreen's
// login, mainly) can tell "server rejected the password" apart from "server
// unreachable" instead of collapsing every failure into one generic message.
export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, requestUrl: string) {
    super(`Request to ${requestUrl} failed with status ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const BASE_URL = String(
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4076",
);

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
  responseHeaders: Headers,
): Promise<void> => {
  const isAuthRequest =
    requestUrl.includes("/user/login") || requestUrl.includes("/user/register");
  if (!isAuthRequest) {
    return;
  }

  const authHeader = responseHeaders.get("authorization");
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
// (see @orval/fetch's generated `options?: RequestInit`).
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

  const response = await fetch(`${BASE_URL}${requestUrl}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // A JWT is only ever invalid/expired here, never on the login/register
      // calls themselves (those return their own 401 for bad credentials
      // while the caller is already logged out) - either way, dropping the
      // stale token and flipping auth state off routes back to AuthStack
      // instead of leaving GameStack up while every call quietly fails.
      await AsyncStorage.removeItem(PERSISTED_TOKEN_KEY);
      store.dispatch(logout());
    }
    throw new ApiRequestError(response.status, requestUrl);
  }

  await persistAuthTokenIfPresent(requestUrl, response.headers);

  const responseText = await response.text();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsedBody = responseText ? JSON.parse(responseText) : undefined;

  // The generated fetcher types this call's result as T from the OpenAPI
  // spec - for a custom mutator, orval always generates that as the
  // axios-style { data, status, headers } shape, regardless of what the
  // mutator itself actually does under the hood (it has no way to
  // introspect arbitrary user code). Wrap the parsed body to match, or
  // every generated fetcher's `.data` access silently reads undefined.
  // Spreading parsedBody (typed any) is what lets this literal's inferred
  // type flow through as any overall, satisfying the generic T below the
  // same way returning parsedBody directly used to - a plain `data:
  // parsedBody` property here would give the object a concrete shape TS
  // can't prove assignable to an arbitrary T.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const wrappedResponse = {
    ...parsedBody,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: parsedBody,
    status: response.status,
    headers: response.headers,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return wrappedResponse;
};
