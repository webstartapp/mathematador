export type Exercise = number[] & {
  separator?: string;
  result?: number;
};

export type Challenge = {
  challengeId: number;
  challengeOrderId: number;
  exercises: Exercise[];
  maxTime: number;
  experiencePoints: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
  operationId: string;
  level: number;
  minigame: string;
  onAnswerSubmit?: (isCorrect: boolean, expectedResult: number) => void;
  onIndexChange?: (index: number) => void;
};

export type ExerciseResult = {
  exercise: Exercise;
  expectedResult: string | number;
  userResult: string | number;
};

export type ChalengeResult = Challenge & {
  successful: boolean;
  results: ExerciseResult[];
  time: number;
  correctAnswers: number;
  coins: number;
  xp: number;
};

export type InputPosition = {
  x: number;
  y: number;
  width: number;
};

export type ExerciseInputPosition = InputPosition & {
  exerciseIndex: number;
  inputIndex: number;
};
