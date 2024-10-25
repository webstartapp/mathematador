import { Exercise } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ChalengeStats = {
  challengeId: number;
  operationId: string;
  exercises: Exercise[];
  correctAnswers: number;
  time: number;
};

type OperationProgress = {
  operationId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentChallengeId: number;
}
interface UserState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  operationProgress: OperationProgress[];
  completedChalenges: ChalengeStats[];
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
  operationProgress: [],
  completedChalenges: [],
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
