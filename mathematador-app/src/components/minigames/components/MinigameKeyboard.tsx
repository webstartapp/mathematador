import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC, useCallback, useMemo } from "react";
import { GestureResponderEvent, PanResponderGestureState, StyleSheet, View } from "react-native";
import { computePositionKey } from "../helpers/computePositionKey";
import { getClosestCell } from "../helpers/getClosestCell";
import DraggableKeyboard from "./DraggableKeyboard";
import { useScreenSizes } from "@/src/hooks/useScreenSizes";

type MinigameKeyboardProps = {
    handleDrop: (exercise: ExerciseInputPosition, value: number) => void;
    exercisePositions: ExerciseInputPosition[];
  };
  
  const MinigameKeyboard: FC<MinigameKeyboardProps> = ({ handleDrop, exercisePositions }) => {
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
      <DraggableKeyboard
        exercisePositions={exercisePositions}
        handleDrag={handleDrag}
        handleDragEnd={handleDragEnd}
      />
    );
  }
  
  export default MinigameKeyboard;
  