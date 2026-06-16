export interface Exercise {
  values: number[];
  result: number;
  separator: string;
  userInput: string;
}

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear Congruential Generator (LCG) to generate deterministic pseudo-random numbers
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const getSeedFromDateString = (dateStr: string): number => {
  let hash = 0;
  for (let charIndex = 0; charIndex < dateStr.length; charIndex++) {
    hash = dateStr.charCodeAt(charIndex) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getRandomInt = (minValue: number, maxValue: number, randomFn = Math.random): number => {
  return Math.floor(randomFn() * (maxValue - minValue + 1)) + minValue;
};

const generateAddition = (level: number, randomFn = Math.random): Exercise => {
  let minValue = 1;
  let maxValue = 10;
  if (level === 2) {
    minValue = 10;
    maxValue = 50;
  } else if (level >= 3) {
    minValue = 50;
    maxValue = 200;
  }
  const value1 = getRandomInt(minValue, maxValue, randomFn);
  const value2 = getRandomInt(minValue, maxValue, randomFn);
  return {
    values: [value1, value2],
    result: value1 + value2,
    separator: "+",
    userInput: ""
  };
};

const generateSubtraction = (level: number, randomFn = Math.random): Exercise => {
  let minValue = 5;
  let maxValue = 10;
  if (level === 2) {
    minValue = 20;
    maxValue = 50;
  } else if (level >= 3) {
    minValue = 50;
    maxValue = 200;
  }
  const value1 = getRandomInt(minValue, maxValue, randomFn);
  const value2 = getRandomInt(1, value1, randomFn); // ensure positive result
  return {
    values: [value1, value2],
    result: value1 - value2,
    separator: "-",
    userInput: ""
  };
};

const generateMultiplication = (level: number, randomFn = Math.random): Exercise => {
  let minValue = 1;
  let maxValue = 5;
  if (level === 2) {
    minValue = 1;
    maxValue = 10;
  } else if (level >= 3) {
    minValue = 5;
    maxValue = 15;
  }
  const value1 = getRandomInt(minValue, maxValue, randomFn);
  const value2 = getRandomInt(minValue, maxValue, randomFn);
  return {
    values: [value1, value2],
    result: value1 * value2,
    separator: "*",
    userInput: ""
  };
};

const generateDivision = (level: number, randomFn = Math.random): Exercise => {
  let minDivisor = 1;
  let maxDivisor = 5;
  let minResult = 1;
  let maxResult = 5;
  if (level === 2) {
    minDivisor = 2;
    maxDivisor = 10;
    minResult = 1;
    maxResult = 10;
  } else if (level >= 3) {
    minDivisor = 5;
    maxDivisor = 15;
    minResult = 5;
    maxResult = 15;
  }
  const divisor = getRandomInt(minDivisor, maxDivisor, randomFn);
  const quotient = getRandomInt(minResult, maxResult, randomFn);
  const dividend = divisor * quotient;
  return {
    values: [dividend, divisor],
    result: quotient,
    separator: "/",
    userInput: ""
  };
};

const generateSingleExercise = (actualOp: string, level: number, randomFn = Math.random): Exercise => {
  switch (actualOp) {
    case "addition":
      return generateAddition(level, randomFn);
    case "subtraction":
      return generateSubtraction(level, randomFn);
    case "multiplication":
      return generateMultiplication(level, randomFn);
    case "division":
      return generateDivision(level, randomFn);
    default:
      throw new Error(`Unsupported operation: ${actualOp}`);
  }
};

export const generateExercises = (operationId: string, level: number, count = 10): Exercise[] => {
  const exercises: Exercise[] = [];

  let randomFn = Math.random;
  let seededGenerator: SeededRandom | null = null;

  if (operationId === "daily_challenge") {
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD in UTC
    const seed = getSeedFromDateString(dateStr);
    seededGenerator = new SeededRandom(seed);
    randomFn = () => seededGenerator!.next();
  }

  const operationsList = ["addition", "subtraction", "multiplication", "division"];

  for (let index = 0; index < count; index++) {
    let actualOp = operationId;
    if (operationId === "gauntlet" || operationId === "daily_challenge") {
      const randIdx = seededGenerator
        ? seededGenerator.nextInt(0, operationsList.length - 1)
        : Math.floor(Math.random() * operationsList.length);
      actualOp = operationsList[randIdx];
    }

    exercises.push(generateSingleExercise(actualOp, level, randomFn));
  }

  return exercises;
};
