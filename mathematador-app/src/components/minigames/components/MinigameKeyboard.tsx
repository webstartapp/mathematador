import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC, useCallback, useMemo } from "react";
import { GestureResponderEvent, PanResponderGestureState, StyleSheet, View } from "react-native";
import { computePositionKey } from "../helpers/computePositionKey";
import { getClosestCell } from "../helpers/getClosestCell";
import DraggableKeyboard from "./DraggableKeyboard";

type MinigameKeyboardProps = {
    handleDrop: (exercise: ExerciseInputPosition, value: number) => void;
    exercisePositions: ExerciseInputPosition[];
  };
  
  const MinigameKeyboard: FC<MinigameKeyboardProps> = ({ handleDrop, exercisePositions }) => {
    const digits = useMemo(() => Array.from({ length: 10 }, (_, index) => index === 9 ? 0 : index + 1), []);
    const handleDragEnd: (value: number, gestureState: PanResponderGestureState) => void = useCallback((value, gestureState) => {
      const exerise = getClosestCell(gestureState.moveX, gestureState.moveY - 50, exercisePositions);
      if (exerise) {
        handleDrop(exerise, value);
      }
    }, [exercisePositions, handleDrop]);
  
    const handleDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void = useCallback((event, gestureState) => {
      // console.log('drag', gestureState.moveX, gestureState.moveY);
    }, []);
    return (
      <View style={styles.keyboardContainer}>
        {digits.map((digit, index) => (
            <DraggableKeyboard
              key={`${digit}_${computePositionKey(exercisePositions)}`}
              renderText={String(digit)}
              onDragRelease={(_event, gestureState)=> handleDragEnd(digit, gestureState)}
              onDrag={handleDrag}
            />
        ))}
      </View>
    );
  }
  

const styles = StyleSheet.create({
    keyboardContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
  });
  
  export default MinigameKeyboard;
  