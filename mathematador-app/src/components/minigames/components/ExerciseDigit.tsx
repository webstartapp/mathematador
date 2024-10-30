import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";


export type ExerciseDigitProps = {
    value?: string;
    updateExercisePositions?: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
    exercisePositions?: ExerciseInputPosition[];
    forwardRef?: (ref: View | null) => void;
    exerciseId: number;
    isUnknown?: boolean;
};

const ExeriseDigit: FC<ExerciseDigitProps> = ({value, forwardRef, isUnknown})=> (
    <View style={isUnknown ? styles.unknownDigitContainer : styles.digitContainer} ref={(refI)=>{
        if(forwardRef) forwardRef(refI);
        }}>
        <Text style={isUnknown ? styles.unknownDigit : styles.digit}>{value || '?'}</Text>
    </View>
);

const styles = StyleSheet.create({
  unknownDigitContainer: {
    borderColor: '#FFFFFF',
    borderWidth: 5,
    backgroundColor: '#744b17',
    borderRadius: 4,
    padding: 5,
    margin: 2,
    minWidth: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitContainer: {
    borderColor: '#E4Ab67',
    borderWidth: 5,
    backgroundColor: '#d49b57',
    borderRadius: 4,
    padding: 5,
    margin: 2,
    minWidth: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unknownDigit: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  digit: {
    fontSize: 22,
  fontWeight: 'bold',
  color: '#fff',
  },
});

  export default ExeriseDigit;