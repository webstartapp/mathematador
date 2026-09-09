import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectIsAuthenticated } from "@/redux/selectors/auth";
import { syncProgress } from "@/redux/slices/userSlice";
import { gameProgress } from "@/src/_generated/api";
import { ApiRequestError } from "@/utils/api-client";

// Bounds how long a caller should wait before giving up and continuing on
// cached state - not a rejection, so it must never log anyone out.
const VERIFICATION_SAFETY_TIMEOUT_MS = 6000;

export type VerificationOutcome = "pending" | "proceed" | "blocked";

// A persisted user.id is just client-controlled localStorage (redux-persist)
// - nothing before this hook ever asked the server whether the accompanying
// token is still valid. GET /game/progress is requireAuth-gated and already
// re-fetches the user row server-side, so a garbage/expired token gets a
// real 401 here (api-client.ts's customInstance already clears the token
// and dispatches logout() for any 401 - this hook just makes sure that
// check actually runs on startup instead of only reactively on whatever
// unrelated authenticated call happens to fire first).
//
// Only a confirmed 401 is treated as a rejection ("blocked"). The server
// merely being unreachable (network failure, or this hook's own safety
// timeout) is NOT a rejection - the game continues on whatever's already
// cached locally, matching the existing offline-first fallback pattern
// (GauntletScreen/TiendaScreen).
export const useSessionVerification = (): VerificationOutcome => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const [outcome, setOutcome] = useState<VerificationOutcome>(
    isAuthenticated ? "pending" : "proceed",
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }
    let isCancelled = false;
    const safetyTimeoutId = setTimeout(() => {
      if (!isCancelled) {
        setOutcome("proceed");
      }
    }, VERIFICATION_SAFETY_TIMEOUT_MS);

    gameProgress()
      .then((response) => {
        if (isCancelled) return;
        dispatch(syncProgress(response.data));
        setOutcome("proceed");
      })
      .catch((error) => {
        if (isCancelled) return;
        const isConfirmedRejection =
          error instanceof ApiRequestError && error.status === 401;
        setOutcome(isConfirmedRejection ? "blocked" : "proceed");
      })
      .finally(() => clearTimeout(safetyTimeoutId));

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimeoutId);
    };
  }, [isAuthenticated, dispatch]);

  return outcome;
};
