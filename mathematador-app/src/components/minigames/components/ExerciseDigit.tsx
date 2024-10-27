import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";


export type ExerciseDigitProps = {
    value?: string;
    updateExercisePositions?: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
    exercisePositions?: ExerciseInputPosition[];
    forwardRef?: (ref: View | null) => void;
    exerciseId: number;
};

const ExeriseDigit: FC<ExerciseDigitProps> = ({value, forwardRef})=> (
    <View style={styles.digitContainer} ref={(refI)=>{
        if(forwardRef) forwardRef(refI);
        }}>
        <Text style={styles.digit}>{value || '?'}</Text>
    </View>
);

const styles = StyleSheet.create({
  digitContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 5,
    margin: 2,
    width: 50,
    height: 50,
  },
  digit: {
    fontSize: 18,
  },
});

  export default ExeriseDigit;