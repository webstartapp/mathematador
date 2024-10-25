import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const calculateXPToNextLevel = (level: number): number => {
  const baseXP = 10;
  const incrementFactor = 1.5;
  return Math.floor((baseXP * Math.pow(level, incrementFactor))/10) * 10;
};

const initialState: UserState = {
  name: 'Corina',
  level: 1,
  xp: 0,
  xpToNextLevel: calculateXPToNextLevel(1),
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
      state.xpToNextLevel = calculateXPToNextLevel(state.level); // Recalculate XP requirement
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
