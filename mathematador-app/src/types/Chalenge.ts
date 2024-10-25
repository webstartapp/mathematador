export type Exercise = number[];
export type Challenge = {
  challengeId: number;
  exercises: Exercise[];
  maxTime: number;
  experiencePoints: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
};