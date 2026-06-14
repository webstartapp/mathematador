export interface Exercise {
  values: number[];
  result: number;
  separator: string;
  userInput: string;
}

const getRandomInt = (minValue: number, maxValue: number): number => {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
};

const generateAddition = (level: number): Exercise => {
  let minValue = 1;
  let maxValue = 10;
  if (level === 2) {
    minValue = 10;
    maxValue = 50;
  } else if (level >= 3) {
    minValue = 50;
    maxValue = 200;
  }
  const value1 = getRandomInt(minValue, maxValue);
  const value2 = getRandomInt(minValue, maxValue);
  return {
    values: [value1, value2],
    result: value1 + value2,
    separator: "+",
    userInput: ""
  };
};

const generateSubtraction = (level: number): Exercise => {
  let minValue = 5;
  let maxValue = 10;
  if (level === 2) {
    minValue = 20;
    maxValue = 50;
  } else if (level >= 3) {
    minValue = 50;
    maxValue = 200;
  }
  const value1 = getRandomInt(minValue, maxValue);
  const value2 = getRandomInt(1, value1); // ensure positive result
  return {
    values: [value1, value2],
    result: value1 - value2,
    separator: "-",
    userInput: ""
  };
};

const generateMultiplication = (level: number): Exercise => {
  let minValue = 1;
  let maxValue = 5;
  if (level === 2) {
    minValue = 1;
    maxValue = 10;
  } else if (level >= 3) {
    minValue = 5;
    maxValue = 15;
  }
  const value1 = getRandomInt(minValue, maxValue);
  const value2 = getRandomInt(minValue, maxValue);
  return {
    values: [value1, value2],
    result: value1 * value2,
    separator: "*",
    userInput: ""
  };
};

const generateDivision = (level: number): Exercise => {
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
  const divisor = getRandomInt(minDivisor, maxDivisor);
  const quotient = getRandomInt(minResult, maxResult);
  const dividend = divisor * quotient;
  return {
    values: [dividend, divisor],
    result: quotient,
    separator: "/",
    userInput: ""
  };
};

export const generateExercises = (operationId: string, level: number, count = 10): Exercise[] => {
  const exercises: Exercise[] = [];

  for (let index = 0; index < count; index++) {
    switch (operationId) {
      case "addition":
        exercises.push(generateAddition(level));
        break;
      case "subtraction":
        exercises.push(generateSubtraction(level));
        break;
      case "multiplication":
        exercises.push(generateMultiplication(level));
        break;
      case "division":
        exercises.push(generateDivision(level));
        break;
      default:
        throw new Error(`Unsupported operation: ${operationId}`);
    }
  }

  return exercises;
};
