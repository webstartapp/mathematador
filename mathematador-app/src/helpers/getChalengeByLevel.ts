import { minigames } from "../configs/minigames";
import { operations } from "../configs/operations";
import { Challenge, Exercise } from "../types/Chalenge";

export const getChallengeByLevel = (level: number, operationId: string, challengeOrderId: number): Challenge => {
    const minigameIndex = challengeOrderId % minigames.length;
    const minigame = minigames[minigameIndex];
    const operation = operations.find((op) => op.operationId === operationId);
    const exerciseCount = 10; // Fixed count of 10 exercises
  
    if (!operation) {
      throw new Error(`Operation with id ${operationId} not found`);
    }
    const exercises: Exercise[] = [];

    const levelComplexity = (level / 2.3) + (challengeOrderId / 20);
    const baseNumbersPerExercise = 2;

    const levelScalingFactor = Math.floor(level / 10); // Increase by 1 every 5 levels
    const numbersPerExercise = baseNumbersPerExercise + levelScalingFactor;

    const complexity = levelComplexity / (numbersPerExercise -1);

    // Parameters for scaling difficulty
    const minNumber = Math.pow(10, ((complexity -1) / 2));
    const maxNumber = Math.pow(10, (complexity));


    let tryedLike = 0;
  
    while (exercises.length < exerciseCount) {
      // Generate an exercise with random numbers
      const exercise = Array.from({ length: numbersPerExercise }, () =>
        Math.floor(Math.random() * (maxNumber - minNumber) + minNumber)
      );
      tryedLike++;
  
      // Check for uniqueness before adding
      const isUnique = !exercises.some((ex) => ex.join("_") === exercise.join("_"));
  
      if (isUnique || ((exercises.length) < tryedLike / 10)) {
        exercises.push(exercise);
      }
    }

    const averageDigits = exercises.reduce((acc, curr) => {
      const nestedAvverage = curr.reduce((acc, curr) => acc + curr, 0);
      return acc + nestedAvverage;
    }, 0) / (exercises.length);

  
    // Challenge attributes that scale with level
    const maxTime = Math.floor((
      (level * 30) + (challengeOrderId)
    ) * (operation?.timeCoeficient || 1));
    const experiencePoints = Math.floor((
      (numbersPerExercise * 12) + (complexity * 26) + challengeOrderId
    ) * (operation?.xpCoeficient || 1) * (minigame.xpCoeficient || 1));
    const coinsOnSuccess = Math.floor((
      experiencePoints * 1.2
    ) * (operation?.xpCoeficient || 1) * (minigame.coinsCoeficient || 1));
    const coinsOnFailure = Math.floor(coinsOnSuccess * 0.4);
  
    return {
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