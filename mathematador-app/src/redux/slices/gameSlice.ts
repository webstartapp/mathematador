import { challenges } from '@/src/configs/challengeExercises';
import { Challenge } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  score: number;
  level: number;
  currentOperation: string | null;
  challenges: Challenge[];
}

const initialState: GameState = {
  score: 0,
  level: 1,
  currentOperation: null,
  challenges: challenges,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentOperation: (state, action: PayloadAction<string | null>) => {
      state.currentOperation = action.payload;
    },
    nextChallenge: (state) => {
      if (state.challenges.length > 0) {
      } else {
        state.currentOperation = null;
      }
    },
    incrementScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },
    nextLevel: (state) => {
      state.level += 1;
      state.score = 0;
    },
  },
});

export const {
  nextChallenge,
  incrementScore,
  nextLevel,
} = gameSlice.actions;

export default gameSlice.reducer;
