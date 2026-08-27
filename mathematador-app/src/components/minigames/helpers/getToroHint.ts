import { Exercise } from "@/types/Chalenge";

const splitTensUnits = (
  value: number,
): { tensPart: number; unitPart: number } => {
  const tensPart = Math.trunc(value / 10) * 10;
  const unitPart = value - tensPart;
  return { tensPart, unitPart };
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
  operationId: string,
  exercise: Exercise,
  answer: number,
): string => {
  const [firstNumber, secondNumber] = exercise;
  if (firstNumber === undefined || secondNumber === undefined) {
    return `Toro whispers the answer: ${answer}!`;
  }
  switch (operationId) {
    case "multiplication":
      return getMultiplicationHint(firstNumber, secondNumber, answer);
    case "addition":
      return getAdditionHint(firstNumber, secondNumber, answer);
    case "subtraction":
      return getSubtractionHint(firstNumber, secondNumber, answer);
    case "division":
      return getDivisionHint(firstNumber, secondNumber, answer);
    default:
      return `Toro whispers the answer: ${answer}!`;
  }
};
