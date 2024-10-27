export type Exercise = number[];

export type Challenge = {
  challengeId: number;
  exercises: Exercise[];
  maxTime: number;
  experiencePoints: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
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