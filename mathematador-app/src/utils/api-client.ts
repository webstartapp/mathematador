import AsyncStorage from "@react-native-async-storage/async-storage";

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

const PERSISTED_TOKEN_KEY = "auth_token";

// The token itself is the single source of truth for "is there a session to
// attach" - it must not be gated on whatever the persisted redux `user` slice
// currently says, since redux-persist writes to AsyncStorage asynchronously
// (debounced) after a dispatch. Reading persisted state here previously
// raced setAuth()'s dispatch: a request made in the same tick (e.g.
// AuthScreen's post-login gameProgress() sync) could see a stale/absent
// persisted id, which deleted the just-stored token outright. Actual
// invalidation (on a confirmed 401, or logout) already happens explicitly
// below and has no dependency on this lookup.
const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(PERSISTED_TOKEN_KEY);
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
    requestUrl.includes("/user/login") ||
    requestUrl.includes("/user/register") ||
    requestUrl.includes("/user/google-login");
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
  const token = await getAuthToken();
  const headers = normalizeHeaders(options.headers);

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${requestUrl}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      // Only invalidate if the token this specific request was sent with is
      // still the one currently stored - otherwise a stale in-flight
      // request's 401 (from a session that has since logged out and a
      // different account logged back in before this response arrived)
      // would wrongly log out the newer, unrelated session. A request made
      // with no token at all (e.g. a failed login attempt) never reaches
      // here either, since there was nothing to invalidate.
      const currentToken = await AsyncStorage.getItem(PERSISTED_TOKEN_KEY);
      if (currentToken === token) {
        await AsyncStorage.removeItem(PERSISTED_TOKEN_KEY);
        store.dispatch(logout());
      }
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
