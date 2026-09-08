import { RootState } from "@/redux/store";

// A truthy check, not `!== null`: redux-persist replaces the whole `user`
// slice wholesale on rehydration (root-level autoMergeLevel1 isn't a deep
// per-field merge), so state persisted before `id` existed on UserState
// rehydrates with `id` missing entirely (undefined), not null.
export const selectIsAuthenticated = (state: RootState): boolean =>
  Boolean(state.user.id);

export const selectIsAdmin = (state: RootState): boolean =>
  state.user.role === "admin";
