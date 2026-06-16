import { FC, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import ExerciseValueDropDigits from "@/components/minigames/components/ExerciseValueDropDigits";
import ExerciseValuePreview from "@/components/minigames/components/ExerciseValuePreview";
import { operations } from "@/src/configs/operations";
import {
  Challenge,
  Exercise as ExerciseType,
  ExerciseInputPosition,
} from "@/src/types/Chalenge";

interface ExerciseProps {
  exerciseId: number;
  challenge: Challenge;
  exerciseResult: Record<string, number>;
  exercisePositions: ExerciseInputPosition[];
  onAnswer: (answer: number) => void;
  updateExercisePositions: (
    exercisePositions: ExerciseInputPosition[],
    exerciseId: number,
  ) => void;
}

export const Exercise: FC<ExerciseProps> = ({
  challenge,
  onAnswer,
  updateExercisePositions,
  exerciseResult,
  exerciseId,
  exercisePositions,
}) => {
  const exerciseIdRef = useRef(exerciseId);
  const operation = operations.find(
    (opItem) => opItem.operationId === challenge.operationId,
  );
  const exerciseItem: ExerciseType = challenge.exercises[exerciseId];
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  const separator = exerciseItem.separator || operation?.symbol;
  const result = useMemo<number | undefined>(() => {
    if (exerciseItem.result !== undefined) {
      return exerciseItem.result;
    }
    return operation?.getResult(exerciseItem);
  }, [exerciseItem, operation]);

  const resultIsFirst = operation?.resultIsFirst || false;

  const exerciseItems = useMemo<number[]>(() => {
    if (result === undefined) return [];
    const exerciseList = [
      ...(resultIsFirst ? [result] : exerciseItem),
      ...(!resultIsFirst ? exerciseItem : [result]),
    ];
    return exerciseList.slice(0, exerciseList.length - 2);
  }, [exerciseItem, resultIsFirst, result]);

  const resultItem = useMemo<number | undefined>(() => {
    if (result === undefined) return undefined;
    return resultIsFirst ? exerciseItems[exerciseItems.length - 1] : result;
  }, [exerciseItems, result, resultIsFirst]);

  useEffect(() => {
    if (resultItem === undefined) return;
    const answer = Object.values(exerciseResult || {});
    if (answer.length === String(resultItem).length) {
      onAnswer(Number(answer.join("")));
    }
  }, [exerciseResult, resultItem, onAnswer]);

  return (
    <View style={styles.exerciseWrapper}>
      <View style={styles.exercisePreviewContainer}>
        {exerciseItems?.map((item, index) => (
          <View style={styles.exerciseValues} key={`${item}_${index}`}>
            <View key={index} style={styles.exerciseValue}>
              {index !== 0 && (
                <ExerciseValuePreview
                  value={separator}
                  exerciseId={exerciseId}
                />
              )}
              <ExerciseValuePreview
                value={String(item)}
                exerciseId={exerciseId}
              />
            </View>
          </View>
        ))}
      </View>
      <ExerciseValuePreview value={"="} exerciseId={exerciseId} />
      <ExerciseValueDropDigits
        value={resultItem || 0}
        updateExercisePositions={(exPositions) =>
          updateExercisePositions(
            exPositions.map((item) => ({
              ...item,
              exerciseIndex: exerciseIdRef.current,
            })),
            exerciseIdRef.current,
          )
        }
        result={exerciseResult}
        exerciseId={exerciseId}
        exercisePositions={exercisePositions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  exercisePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    userSelect: "none",
    flexWrap: "wrap",
  },
  exerciseValues: {
    flexDirection: "row",
    alignItems: "center",
    userSelect: "none",
  },
  exerciseValue: {
    flexDirection: "row",
    alignItems: "center",
    userSelect: "none",
  },
});
