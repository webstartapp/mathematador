import { Exercise } from "@/types/Chalenge";

// Matches the raw separators mathGenerator.ts stamps onto each exercise
// (server/src/utils/mathGenerator.ts) - these are NOT the same as the
// display symbols in configs/operations.ts (which uses "x" for display).
const SEPARATOR_TO_OPERATION: Record<string, string> = {
  "+": "addition",
  "-": "subtraction",
  "*": "multiplication",
  "/": "division",
};

const splitTensUnits = (
  value: number,
): { tensPart: number; unitPart: number } => {
  const tensPart = Math.trunc(value / 10) * 10;
  const unitPart = value - tensPart;
  return { tensPart, unitPart };
};

const resolveOperationId = (
  challengeOperationId: string,
  exercise: Exercise,
): string => {
  if (exercise.separator && SEPARATOR_TO_OPERATION[exercise.separator]) {
    return SEPARATOR_TO_OPERATION[exercise.separator];
  }
  return challengeOperationId;
};

const computeAnswer = (
  operationId: string,
  firstNumber: number,
  secondNumber: number,
): number => {
  switch (operationId) {
    case "multiplication":
      return firstNumber * secondNumber;
    case "subtraction":
      return firstNumber - secondNumber;
    case "division":
      return firstNumber / secondNumber;
    default:
      return firstNumber + secondNumber;
  }
};

const getMultiplicationHint = (
  firstNumber: number,
  secondNumber: number,
  answer: number,
): string => {
  const largerFactor = Math.max(firstNumber, secondNumber);
  const smallerFactor = Math.min(firstNumber, secondNumber);
  const { tensPart, unitPart } = splitTensUnits(largerFactor);
  if (tensPart === 0 || unitPart === 0) {
    return `Toro whispers: ${firstNumber} × ${secondNumber} = ${answer}!`;
  }
  const firstPart = tensPart * smallerFactor;
  const secondPart = unitPart * smallerFactor;
  return `Try: ${tensPart} × ${smallerFactor} + ${unitPart} × ${smallerFactor} = ${firstPart} + ${secondPart} = ${answer}`;
};

const getAdditionHint = (
  firstNumber: number,
  secondNumber: number,
  answer: number,
): string => {
  const { tensPart, unitPart } = splitTensUnits(secondNumber);
  if (tensPart === 0) {
    return `Toro whispers: ${firstNumber} + ${secondNumber} = ${answer}!`;
  }
  const partialSum = firstNumber + tensPart;
  return `Try: ${firstNumber} + ${tensPart} + ${unitPart} = ${partialSum} + ${unitPart} = ${answer}`;
};

const getSubtractionHint = (
  firstNumber: number,
  secondNumber: number,
  answer: number,
): string => {
  const { tensPart, unitPart } = splitTensUnits(secondNumber);
  if (tensPart === 0) {
    return `Toro whispers: ${firstNumber} − ${secondNumber} = ${answer}!`;
  }
  const partialDiff = firstNumber - tensPart;
  return `Try: ${firstNumber} − ${tensPart} − ${unitPart} = ${partialDiff} − ${unitPart} = ${answer}`;
};

const getDivisionHint = (
  firstNumber: number,
  secondNumber: number,
  answer: number,
): string => {
  if (secondNumber === 0) {
    return `Toro whispers: ${firstNumber} ÷ ${secondNumber} = ${answer}!`;
  }
  return `Think in reverse: what number times ${secondNumber} makes ${firstNumber}? (${secondNumber} × ${answer} = ${firstNumber})`;
};

export const getToroHintText = (
  challengeOperationId: string,
  exercise: Exercise,
): string => {
  const [firstNumber, secondNumber] = exercise;
  if (firstNumber === undefined || secondNumber === undefined) {
    return "Toro is thinking hard about this one!";
  }
  const resolvedOperationId = resolveOperationId(
    challengeOperationId,
    exercise,
  );
  const answer =
    exercise.result !== undefined
      ? exercise.result
      : computeAnswer(resolvedOperationId, firstNumber, secondNumber);
  switch (resolvedOperationId) {
    case "multiplication":
      return getMultiplicationHint(firstNumber, secondNumber, answer);
    case "subtraction":
      return getSubtractionHint(firstNumber, secondNumber, answer);
    case "division":
      return getDivisionHint(firstNumber, secondNumber, answer);
    default:
      return getAdditionHint(firstNumber, secondNumber, answer);
  }
};
