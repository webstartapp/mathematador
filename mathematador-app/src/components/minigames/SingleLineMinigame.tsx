import { FC, useState } from "react";
import { Text } from "react-native";

import { Exercise } from "@/components/minigames/components/Exercise";
import HalvingLayout from "@/components/minigames/components/HalvingLayout";
import MinigameKeyboard from "@/components/minigames/components/MinigameKeyboard";
import { computePositionKey } from "@/components/minigames/helpers/computePositionKey";
import { getChallengeResult } from "@/components/minigames/helpers/getChallengeResult";
import { operations } from "@/configs/operations";
import { MinigameComponentProps } from "@/src/configs/minigames";
import { ExerciseInputPosition } from "@/src/types/Chalenge";

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
    if (currentExerciseIndex === exercises.length - 1) {
      const expectedResults = exercises.map((exercise) =>
        getResult(exercise.slice(0, 2)),
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
      setCurrentExerciseIndex(currentExerciseIndex + 1);
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
