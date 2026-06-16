import { FC, useState } from "react";
import { Text } from "react-native";

import { Exercise } from "@/components/minigames/components/Exercise";
import HalvingLayout from "@/components/minigames/components/HalvingLayout";
import MinigameKeyboard from "@/components/minigames/components/MinigameKeyboard";
import { computePositionKey } from "@/components/minigames/helpers/computePositionKey";
import { getChallengeResult } from "@/components/minigames/helpers/getChallengeResult";
import { operations } from "@/configs/operations";
import { MinigameComponentProps } from "@/src/configs/minigames";
import {
  Exercise as ExerciseType,
  ExerciseInputPosition,
} from "@/src/types/Chalenge";

const toExerciseType = (numbers: number[]): ExerciseType => {
  const exerciseObj: ExerciseType = Object.assign(numbers, {});
  return exerciseObj;
};

const SingleLine: FC<MinigameComponentProps> = ({
  challenge,
  submitResults,
}) => {
  const operationConfig = operations.find(
    (operation) => operation.operationId === challenge.operationId,
  );

  const [exercisePositions, setExercisePositions] = useState<
    ExerciseInputPosition[]
  >([]);
  const [exerciseResults, setExerciseResults] = useState<
    Record<string, Record<string, number>>
  >({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const addResponse = (
    exerciseId: number,
    keyId: number,
    value: number,
  ): void => {
    setExerciseResults((prev) => {
      const newResults = { ...prev };
      if (!newResults[exerciseId]) newResults[exerciseId] = {};
      newResults[exerciseId][keyId] = value;
      return newResults;
    });
  };

  if (!challenge || !operationConfig) {
    return <Text>Challenge or Operation not found.</Text>;
  }

  const { getResult } = operationConfig;

  const exercises = challenge.exercises;

  const handleAnswer = (): void => {
    // 1. Evaluate correctness for real-time widgets (combo streak, Toro Cooperation)
    const exerciseItem: ExerciseType = exercises[currentExerciseIndex];
    const expected =
      exerciseItem.result !== undefined
        ? exerciseItem.result
        : getResult(toExerciseType(exerciseItem.slice(0, 2)));
    const userAns = Number(
      Object.values(exerciseResults[currentExerciseIndex] || {}).join(""),
    );
    const isCorrect = userAns === expected;

    if (challenge.onAnswerSubmit) {
      challenge.onAnswerSubmit(isCorrect, expected);
    }

    // 2. Advance exercise index or complete challenge
    if (currentExerciseIndex === exercises.length - 1) {
      const expectedResults: number[] = exercises.map(
        (item: ExerciseType): number => {
          if (item.result !== undefined) {
            return item.result;
          }
          return getResult(toExerciseType(item.slice(0, 2)));
        },
      );
      const results = getChallengeResult(
        challenge,
        exerciseResults,
        expectedResults,
      );
      setExerciseResults({});
      submitResults(results, challenge);
    } else {
      setExercisePositions([]);
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      if (challenge.onIndexChange) {
        challenge.onIndexChange(nextIdx);
      }
    }
  };

  return (
    <HalvingLayout
      upperPercentage={75}
      UpperComponent={
        <Exercise
          challenge={challenge}
          exerciseId={currentExerciseIndex}
          exerciseResult={exerciseResults[currentExerciseIndex]}
          onAnswer={handleAnswer}
          exercisePositions={exercisePositions}
          updateExercisePositions={(
            exPositions: ExerciseInputPosition[],
            exerciseIndex: number,
          ) => {
            setExercisePositions((prev) => {
              const newPositions = prev.filter(
                (position) => position.exerciseIndex !== exerciseIndex,
              );
              return [...newPositions, ...exPositions];
            });
          }}
        />
      }
      LowerComponent={
        <MinigameKeyboard
          key={computePositionKey(exercisePositions)}
          handleDrop={(exercisePosition, value) =>
            addResponse(
              exercisePosition.exerciseIndex,
              exercisePosition.inputIndex,
              value,
            )
          }
          exercisePositions={exercisePositions}
        />
      }
    />
  );
};

export default SingleLine;
