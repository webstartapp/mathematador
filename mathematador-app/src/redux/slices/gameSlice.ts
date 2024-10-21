import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Challenge {
  id: number;
  question: string;
  answer: string;
}

interface GameState {
  score: number;
  level: number;
  currentChallenge: Challenge | null;
  challenges: Challenge[];
  progress: { level: number; score: number }[];
}

const initialState: GameState = {
  score: 0,
  level: 1,
  currentChallenge: null,
  challenges: [],
  progress: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.challenges = action.payload;
    },
    nextChallenge: (state) => {
      if (state.challenges.length > 0) {
        state.currentChallenge = state.challenges.shift() || null;
      } else {
        state.currentChallenge = null;
      }
    },
    incrementScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },
    nextLevel: (state) => {
      state.level += 1;
      state.progress.push({ level: state.level, score: state.score });
      state.score = 0;
    },
    resetGame: (state) => {
      state.score = 0;
      state.level = 1;
      state.currentChallenge = null;
      state.challenges = [];
      state.progress = [];
    },
    generateQuestion: (state, action: PayloadAction<number>) => {
      // Assuming that this action generates a challenge based on a given challengeId
      const challengeId = action.payload;
      const newChallenge: Challenge = {
        id: challengeId,
        question: `What is ${challengeId} + ${challengeId}?`, // Replace with real logic
        answer: String(challengeId * 2), // Replace with real logic
      };
      state.currentChallenge = newChallenge;
    },
    checkAnswer: (
      state,
      action: PayloadAction<{ challengeId: number; answer: string }>
    ) => {
      const { challengeId, answer } = action.payload;

      // Check if the current challenge matches the provided challengeId
      if (state.currentChallenge && state.currentChallenge.id === challengeId) {
        if (state.currentChallenge.answer === answer) {
          state.score += 10; // Correct answer, increment score (adjust as needed)
        } else {
          state.score -= 5; // Wrong answer, decrement score (adjust as needed)
        }
        // Move to the next challenge
        state.currentChallenge = null;
      }
    },
  },
});

export const {
  setChallenges,
  nextChallenge,
  incrementScore,
  nextLevel,
  resetGame,
  generateQuestion,
  checkAnswer,
} = gameSlice.actions;

export default gameSlice.reducer;
