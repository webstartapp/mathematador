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

  let currentStreak = 0;
  let inspiredAnswersCount = 0;
  exerciseResult.forEach((resultItem) => {
    const isCorrect =
      String(resultItem.expectedResult) === String(resultItem.userResult);
    if (isCorrect) {
      if (currentStreak >= 3) {
        inspiredAnswersCount++;
      }
      currentStreak++;
    } else {
      currentStreak = 0;
    }
  });

  const totalQuestions = challenge.exercises.length || 10;
  const isSuccess = correctAnswers + 1 >= totalQuestions;
  const inspiredBonus = isSuccess
    ? Math.floor(
        inspiredAnswersCount * (challenge.experiencePoints / totalQuestions),
      )
    : 0;
  const inspiredCoinsBonus = isSuccess
    ? Math.floor(
        inspiredAnswersCount * (challenge.coinsOnSuccess / totalQuestions),
      )
    : 0;

  return {
    ...challenge,
    results: exerciseResult,
    time: 0,
    correctAnswers,
    successful: isSuccess,
    coins: Math.ceil(
      (correctAnswers === challenge.exercises.length
        ? challenge.coinsOnSuccess
        : challenge.coinsOnFailure) + inspiredCoinsBonus,
    ),
    xp: Math.ceil(challenge.experiencePoints + inspiredBonus),
  };
};
