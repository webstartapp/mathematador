import { useCallback, useEffect, useRef, useState } from "react";

import { waitForPendingUserSettingsWrites } from "@/hooks/useSyncUserSettings";
import { userSettingsGetHistory } from "@/src/_generated/api";
import { UserSetting } from "@/src/_generated/model";
import { getOrCreateDeviceId } from "@/utils/consent";

export type HistoryLoadState = "loading" | "loaded" | "error";

interface SettingsHistoryPage {
  loadState: HistoryLoadState;
  entries: UserSetting[];
  currentDeviceId: string | null;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

// Owns the paginated fetch/append logic for SettingsHistoryScreen - split
// out so the screen component itself can stay under this repo's
// max-lines limit once "load more" support is added on top of everything
// else the screen already renders.
export const useSettingsHistoryPage = (): SettingsHistoryPage => {
  const [loadState, setLoadState] = useState<HistoryLoadState>("loading");
  const [entries, setEntries] = useState<UserSetting[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Guards against a slow first page's response landing after a "load
  // more" tap already started a second request - appending the first
  // page's entries after the second page's would show them out of order.
  const isFirstPageInFlightRef = useRef(true);

  useEffect(() => {
    let isCancelled = false;
    getOrCreateDeviceId()
      .then((deviceId) => {
        if (!isCancelled) setCurrentDeviceId(deviceId);
      })
      .catch(() => {
        // Rows just render their own device id instead of "This device".
      });
    // Wait for any still-queued toggle to actually reach the server first -
    // otherwise navigating here right after a toggle can have this GET race
    // that POST and render a history list missing the just-made change.
    waitForPendingUserSettingsWrites()
      .then(() => userSettingsGetHistory())
      .then((response) => {
        if (isCancelled) return;
        setEntries(response?.data?.items ?? []);
        setNextCursor(response?.data?.nextCursor ?? null);
        setLoadState("loaded");
      })
      .catch(() => {
        // Unlike the current-settings screen, there's no sensible local
        // fallback for a change log - show a real error instead of
        // silently rendering stale/fabricated data.
        if (!isCancelled) setLoadState("error");
      })
      .finally(() => {
        isFirstPageInFlightRef.current = false;
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const loadMore = useCallback((): void => {
    if (isFirstPageInFlightRef.current || isLoadingMore || !nextCursor) {
      return;
    }
    setIsLoadingMore(true);
    userSettingsGetHistory({ cursor: nextCursor })
      .then((response) => {
        setEntries((previousEntries) => [
          ...previousEntries,
          ...(response?.data?.items ?? []),
        ]);
        setNextCursor(response?.data?.nextCursor ?? null);
      })
      .catch(() => {
        // Leaves nextCursor as-is so the user can just tap "Load More"
        // again rather than losing the ability to page further.
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [isLoadingMore, nextCursor]);

  return {
    loadState,
    entries,
    currentDeviceId,
    hasNextPage: nextCursor !== null,
    isLoadingMore,
    loadMore,
  };
};
