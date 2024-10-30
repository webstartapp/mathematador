import { operations } from '@/src/configs/operations';
import { calculateXPToNextLevel } from '@/src/helpers/calculateXPToNextLevel';
import { getChallengeByLevel } from '@/src/helpers/getChalengeByLevel';
import { ChalengeResult, Challenge, Exercise } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OperationProgress = {
  operationId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentChallengeId: number;
  currentChallenge: Challenge;
  completedChallenges: ChalengeResult[];
}
interface UserState {
  name: string;
  level: number;
  xp: number;
  coins: number;
  xpToNextLevel: number;
  operationProgress: OperationProgress[];
}

const initialState: UserState = {
  name: 'Corina',
  level: 1,
  xp: 0,
  coins: 0,
  xpToNextLevel: calculateXPToNextLevel(1 * 2),
  operationProgress: operations.map(operation => ({
    completedChallenges: [],
    currentChallengeId: 1,
    level: 1,
    operationId: operation.operationId,
    xp: 0,
    xpToNextLevel: calculateXPToNextLevel(1),
    currentChallenge: getChallengeByLevel(1, operation.operationId, 1),
  })),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    levelUserUp(state) {
      state.level += 1;
      state.xp = state.xp - state.xpToNextLevel; // Reset XP
      state.xpToNextLevel = calculateXPToNextLevel(state.level); // Recalculate XP requirement
    },
    levelOperationUp(state, action: PayloadAction<string>) {
      const operationProgress = state.operationProgress.find(op => op.operationId === action.payload);
      if (operationProgress) {
        operationProgress.level += 1;
        operationProgress.xp = operationProgress.xp - operationProgress.xpToNextLevel;
        operationProgress.xpToNextLevel = calculateXPToNextLevel(operationProgress.level);
        operationProgress.currentChallenge = getChallengeByLevel(operationProgress.level, operationProgress.operationId, operationProgress.currentChallengeId);
      }
    },
    completeChalange(state, action: PayloadAction<ChalengeResult>) {
      console.log(50, action.payload);
      state.xp += action.payload.xp;
      state.coins += action.payload.coins;
      const operationProgress = state.operationProgress.find(op => op.operationId === action.payload.operationId);
      if (operationProgress && operationProgress.currentChallengeId === action.payload.challengeOrderId) {
        const nextChallengeId = operationProgress.currentChallengeId + 1;
        operationProgress.xp += action.payload.xp;
        operationProgress.currentChallengeId = nextChallengeId;
        operationProgress.currentChallenge = getChallengeByLevel(operationProgress.level, operationProgress.operationId, nextChallengeId);
        operationProgress.completedChallenges.push(action.payload);
      }
    }
    // Add other reducers as needed
  },
});

export const { setName, levelOperationUp, levelUserUp, completeChalange } = userSlice.actions;
export default userSlice.reducer;
