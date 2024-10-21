import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  level: number;
  xp: number;
  // Add other user-related state
}

const initialState: UserState = {
  name: 'Corina',
  level: 1,
  xp: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    levelUp(state) {
      state.level += 1;
      state.xp = 0;
    },
    addXP(state, action: PayloadAction<number>) {
      state.xp += action.payload;
      // Add logic for leveling up if xp exceeds threshold
    },
    // Add other reducers as needed
  },
});

export const { setName, levelUp, addXP } = userSlice.actions;
export default userSlice.reducer;
