import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationParams {
  operation?: string;
  challengeId?: number;
  levelId?: number;
}

type NavigationState = {
  backToParams: NavigationParams;
};

const initialState: NavigationState = {
  backToParams: {},
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setBackToRoute: (
      state,
      action: PayloadAction<{ params?: NavigationParams }>,
    ) => {
      state.backToParams = {
        ...state.backToParams,
        ...action.payload.params,
      };
    },
    clearBackToRoute: (state) => {
      state.backToParams = {};
    },
  },
});

export const { setBackToRoute, clearBackToRoute } = navigationSlice.actions;
export default navigationSlice.reducer;
