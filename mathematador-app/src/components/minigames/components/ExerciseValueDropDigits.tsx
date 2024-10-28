import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import ExerciseValuePreview from "./ExerciseValuePreview";
import { useScreenSizes } from "@/src/hooks/useScreenSizes";


type ExerciseValueDropDigitsProps = {
    value: number | string;
    updateExercisePositions: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
    result?: Record<string, number>;
    exerciseId: number;
    exercisePositions: ExerciseInputPosition[];
  };
  
  const ExerciseValueDropDigits: FC<ExerciseValueDropDigitsProps> = ({ value, updateExercisePositions, result, exerciseId, exercisePositions }) => {
    const exerciseIdRef = useRef(exerciseId);
    useEffect(() => {
      exerciseIdRef.current = exerciseId;
    }, [exerciseId]);

    const { primarySize } = useScreenSizes(75);


  
    const partialResult = useMemo(() => {
      return String(value).split('').map((v, i) => result && result[i] ? result[i] : '?').join('');
    }, [value, Object.values(result || {}).join('')]);
    return (
      <View style={styles.resultValue}>
        <ExerciseValuePreview
          key={`exerciseId_{exerciseId}_${Math.floor(primarySize.width)}_${Math.floor(primarySize.height / 5)}`}
          value={partialResult}
          updateExercisePositions={updateExercisePositions}
          exercisePositions={exercisePositions}
          exerciseId={exerciseId}
        />
      </View>
    );
  };
  
const styles = StyleSheet.create({
  resultValue: {
    marginLeft: 10,
  },
});

export default ExerciseValueDropDigits;
