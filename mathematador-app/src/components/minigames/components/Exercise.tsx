import { FC, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import ExerciseValueDropDigits from "@/components/minigames/components/ExerciseValueDropDigits";
import ExerciseValuePreview from "@/components/minigames/components/ExerciseValuePreview";
import { operations } from "@/src/configs/operations";
import { Challenge, ExerciseInputPosition } from "@/src/types/Chalenge";

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
    (operation) => operation.operationId === challenge.operationId,
  );
  const exercise = challenge.exercises[exerciseId];
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  const result = useMemo(
    () => operation?.getResult(exercise),
    [exercise, operation],
  );

  const exerciseItems = useMemo(() => {
    const exerciseList = [
      ...(operation?.resultIsFirst ? [result] : exercise),
      ...(!operation?.resultIsFirst ? exercise : [result]),
    ];
    return exerciseList.slice(0, exerciseList.length - 2);
  }, [exercise, operation, result]);

  const resultItem = useMemo(() => {
    return operation?.resultIsFirst
      ? exerciseItems[exerciseItems.length - 1]
      : result;
  }, [exerciseItems, result, operation]);

  useEffect(() => {
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
                  value={operation?.symbol}
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
