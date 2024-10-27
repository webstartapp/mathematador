import { ChalengeResult, Exercise } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  coins: number;
  xpToNextLevel: number;
  operationProgress: OperationProgress[];
  completedChalenges: ChalengeResult[];
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
  coins: 0,
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
    completeChalange(state, action: PayloadAction<ChalengeResult>) {
      state.xp += action.payload.xp;
      state.coins += action.payload.coins;
      const operationProgress = state.operationProgress.find(op => op.operationId === action.payload.operationId);
      if (operationProgress) {
        operationProgress.xp += action.payload.xp;
      } else {
        state.operationProgress.push({
          operationId: action.payload.operationId,
          level: 1,
          xp: action.payload.xp,
          xpToNextLevel: calculateXPToNextLevel(1),
          currentChallengeId: action.payload.challengeId + 1,
        });
      }
      state.completedChalenges.push(action.payload);
    }
    // Add other reducers as needed
  },
});

export const { setName, levelUp, completeChalange } = userSlice.actions;
export default userSlice.reducer;
