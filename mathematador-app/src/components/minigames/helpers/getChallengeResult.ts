import {
  ChalengeResult,
  Challenge,
  ExerciseResult,
} from "@/src/types/Chalenge";

export const getChallengeResult = (
  challenge: Challenge,
  results: Record<string, Record<string, number>>,
  expectedResult: (string | number)[],
): ChalengeResult => {
  const exerciseResult: ExerciseResult[] = challenge.exercises.map(
    (exercise, index): ExerciseResult => {
      const userResult = Object.values(results[index] || {}).join("");
      return {
        expectedResult: expectedResult[index],
        userResult,
        exercise,
      };
    },
  );
  const correctAnswers = exerciseResult.filter(
    (exercise) =>
      String(exercise.expectedResult) === String(exercise.userResult),
  ).length;
  return {
    ...challenge,
    results: exerciseResult,
    time: 0,
    correctAnswers,
    successful: correctAnswers + 1 >= challenge.exercises.length,
    coins: Math.ceil(
      correctAnswers === challenge.exercises.length
        ? challenge.coinsOnSuccess
        : challenge.coinsOnFailure,
    ),
    xp: Math.ceil(challenge.experiencePoints),
  };
};
