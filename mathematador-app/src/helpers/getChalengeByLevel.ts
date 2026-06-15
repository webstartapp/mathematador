import { minigames } from "@/configs/minigames";
import { operations } from "@/configs/operations";
import { Challenge, Exercise } from "@/types/Chalenge";

const generateExercises = (
  numbersPerExercise: number,
  minNumber: number,
  maxNumber: number,
  count: number,
): Exercise[] => {
  const exercises: Exercise[] = [];
  let tryedLike = 0;
  while (exercises.length < count) {
    const exercise = Array.from({ length: numbersPerExercise }, () =>
      Math.floor(Math.random() * (maxNumber - minNumber) + minNumber),
    );
    tryedLike++;
    const isUnique = !exercises.some(
      (exerciseItem) => exerciseItem.join("_") === exercise.join("_"),
    );
    if (isUnique || exercises.length < tryedLike / 10) {
      exercises.push(exercise);
    }
  }
  return exercises;
};

export const getChallengeByLevel = (
  level: number,
  operationId: string,
  challengeOrderId: number,
): Challenge => {
  const minigameIndex = challengeOrderId % minigames.length;
  const minigame = minigames[minigameIndex];
  const operation = operations.find(
    (opItem) => opItem.operationId === operationId,
  );
  if (!operation) {
    throw new Error(`Operation with id ${operationId} not found`);
  }

  const exerciseCount = 10;
  const levelComplexity = level / 2.3 + challengeOrderId / 20;
  const baseNumbersPerExercise = 2;
  const levelScalingFactor = Math.floor(level / 10);
  const numbersPerExercise = baseNumbersPerExercise + levelScalingFactor;
  const complexity = levelComplexity / (numbersPerExercise - 1);

  const minNumber = Math.pow(10, (complexity - 1) / 2);
  const maxNumber = Math.pow(10, complexity);

  const exercises = generateExercises(
    numbersPerExercise,
    minNumber,
    maxNumber,
    exerciseCount,
  );

  const timeCoef = operation.timeCoeficient ?? 1;
  const xpCoef = operation.xpCoeficient ?? 1;
  const minigameXpCoef = minigame.xpCoeficient ?? 1;
  const minigameCoinsCoef = minigame.coinsCoeficient ?? 1;

  const maxTime = Math.floor((level * 30 + challengeOrderId) * timeCoef);
  const experiencePoints = Math.floor(
    (numbersPerExercise * 12 + complexity * 26 + challengeOrderId) *
      xpCoef *
      minigameXpCoef,
  );
  const coinsOnSuccess = Math.floor(
    experiencePoints * 1.2 * xpCoef * minigameCoinsCoef,
  );
  const coinsOnFailure = Math.floor(coinsOnSuccess * 0.4);

  return {
    challengeId: challengeOrderId,
    challengeOrderId,
    minigame: minigame.id,
    level,
    operationId,
    exercises,
    maxTime,
    experiencePoints,
    coinsOnSuccess,
    coinsOnFailure,
  };
};
