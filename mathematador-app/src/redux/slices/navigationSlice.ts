import { RootStackParamList } from '@/src/types/Navigation';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationParams {
    operation: string;
    challengeId: number;
    levelId: number;
}

type NavigationState = {
    backToParams: NavigationParams;
}

const initialState: NavigationState = {
    backToParams: {} as NavigationParams,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setBackToRoute: (state, action: PayloadAction<{ params?: NavigationState }>) => {
        state.backToParams = {
            ...state.backToParams,
            ...action.payload.params,
        }
    },
    clearBackToRoute: (state) => {
        state.backToParams = {} as NavigationParams;
    },
  },
});

export const { setBackToRoute, clearBackToRoute } = navigationSlice.actions;
export default navigationSlice.reducer;
