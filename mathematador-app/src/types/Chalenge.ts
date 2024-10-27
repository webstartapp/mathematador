export type Exercise = number[];

export type Challenge = {
  challengeId: number;
  exercises: Exercise[];
  maxTime: number;
  experiencePoints: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
};

export type ExerciseResult = {
  challengeId: number;
  exercise: Exercise;
  operationId: string;
  expectedResult: string | number;
  userResult: string | number;
};

export type ChalengeResult = {
  challengeId: number;
  operationId: string;
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
}

export type ExerciseInputPosition = InputPosition & {
    exerciseIndex: number;
    inputIndex: number;
  };