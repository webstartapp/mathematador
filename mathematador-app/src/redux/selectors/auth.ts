import { RootState } from "@/redux/store";

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.user.id !== null;

export const selectIsAdmin = (state: RootState): boolean =>
  state.user.role === "admin";
