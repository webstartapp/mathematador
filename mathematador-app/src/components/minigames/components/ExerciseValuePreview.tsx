import { FC, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import ExeriseDigit, {
  ExerciseDigitProps,
} from "@/components/minigames/components/ExerciseDigit";
import { computePositionKey } from "@/components/minigames/helpers/computePositionKey";
import { ExerciseInputPosition } from "@/src/types/Chalenge";

const ExerciseValuePreview: FC<ExerciseDigitProps> = ({
  value,
  updateExercisePositions,
  exercisePositions = [],
  exerciseId,
}) => {
  const refferenceDigits = useRef<(View | null)[]>([]);
  const [layoutsReady, setLayoutsReady] = useState<number[]>();

  useEffect(() => {
    setLayoutsReady([]);
  }, [value]);

  useEffect(() => {
    const measurePositions = async (): Promise<void> => {
      const localPositions: ExerciseInputPosition[] = [];
      for (let index = 0; index < refferenceDigits.current.length; index++) {
        const refItem = refferenceDigits.current[index];
        if (refItem) {
          const position = await new Promise<ExerciseInputPosition>(
            (resolve) => {
              refItem.measure(
                // eslint-disable-next-line max-params
                (_unusedX, _unusedY, width, height, pageX, pageY) => {
                  resolve({
                    x: pageX + width / 2,
                    y: pageY + height / 2,
                    width,
                    exerciseIndex: 0,
                    inputIndex: index,
                  });
                },
              );
            },
          );
          if (position) localPositions.push(position);
        }
      }
      if (
        updateExercisePositions &&
        localPositions.length >= String(value).length
      ) {
        if (
          computePositionKey(localPositions) !==
          computePositionKey(exercisePositions)
        ) {
          updateExercisePositions(localPositions, 0);
        }
      }
    };
    if (layoutsReady?.length === String(value).length) {
      void measurePositions();
    }
  }, [updateExercisePositions, value, exercisePositions, layoutsReady]);

  return (
    <View style={styles.numberContainer}>
      {String(value)
        .split("")
        .map((valueChar, index) => (
          <View
            key={`${index}_${computePositionKey(exercisePositions)}_${value}`}
            onLayout={() =>
              setLayoutsReady((prev) =>
                prev?.includes(index) ? prev : [...(prev || []), index],
              )
            }
          >
            <ExeriseDigit
              value={valueChar}
              forwardRef={(digitRef) => {
                refferenceDigits.current[index] = digitRef;
              }}
              isUnknown={valueChar === "?"}
              exerciseId={exerciseId}
            />
          </View>
        ))}
    </View>
  );
};

export default ExerciseValuePreview;

const styles = StyleSheet.create({
  numberContainer: {
    flexDirection: "row",
  },
});
