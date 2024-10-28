import { Challenge, Exercise } from "../types/Chalenge";

export const getChallengeByLevel = (level: number): Challenge => {
    const exerciseCount = 10; // Fixed count of 10 exercises
  
    const exercises: Exercise[] = [];
  
    // Parameters for scaling difficulty
    const minNumber = Math.pow(10, Math.max(0, level - 1));
    const maxNumber = Math.pow(10, level);
    
    // Adjust numbersPerExercise based on level (e.g., increase every 5 levels)
    const baseNumbersPerExercise = 2;
    const levelScalingFactor = Math.floor(level / 5); // Increase by 1 every 5 levels
    const numbersPerExercise = baseNumbersPerExercise + levelScalingFactor;
  
    while (exercises.length < exerciseCount) {
      // Generate an exercise with random numbers
      const exercise = Array.from({ length: numbersPerExercise }, () =>
        Math.floor(Math.random() * (maxNumber - minNumber) + minNumber)
      );
  
      // Check for uniqueness before adding
      const isUnique = !exercises.some((ex) =>
        ex.every((num, idx) => num === exercise[idx])
      );
  
      if (isUnique) {
        exercises.push(exercise);
      }
    }
  
    // Challenge attributes that scale with level
    const maxTime = 30 - level;
    const experiencePoints = level * 10;
    const coinsOnSuccess = Math.min(20, level * 10);
    const coinsOnFailure = Math.min(5, level * 2);
  
    return {
      challengeId: Date.now(),
      exercises,
      maxTime,
      experiencePoints,
      coinsOnSuccess,
      coinsOnFailure,
    };
  };