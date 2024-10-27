import { challenges } from '@/src/configs/challengeExercises';
import { Challenge, ExerciseInputPosition, InputPosition } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  score: number;
  level: number;
  currentOperation: string | null;
  challenges: Challenge[];
  inputPositions: ExerciseInputPosition[];
}

const initialState: GameState = {
  score: 0,
  level: 1,
  currentOperation: null,
  challenges: challenges,
  inputPositions: [],
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
    setInputPositions: (state, action: PayloadAction<ExerciseInputPosition[]>) => {
      const newExercises = action.payload.map(({exerciseIndex}) => exerciseIndex);
      const updatedInputPositions = state.inputPositions.filter(position=> !newExercises.includes(position.exerciseIndex));
      state.inputPositions = [...updatedInputPositions, ...action.payload];
    },
    keepOnlyInputPositions: (state, actions: PayloadAction<number[]>) => {
      state.inputPositions = state.inputPositions.filter(({exerciseIndex}) => actions.payload.includes(exerciseIndex));
    }
  },
});

export const {
  nextChallenge,
  incrementScore,
  nextLevel,
  keepOnlyInputPositions,
  setInputPositions,
} = gameSlice.actions;

export default gameSlice.reducer;
