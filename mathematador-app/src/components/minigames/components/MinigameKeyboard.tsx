import { FC, useCallback } from "react";
import { GestureResponderEvent, PanResponderGestureState } from "react-native";

import DraggableKeyboard from "@/components/minigames/components/DraggableKeyboard";
import { getClosestCell } from "@/components/minigames/helpers/getClosestCell";
import { ExerciseInputPosition } from "@/src/types/Chalenge";

type MinigameKeyboardProps = {
  handleDrop: (exercise: ExerciseInputPosition, value: number) => void;
  exercisePositions: ExerciseInputPosition[];
  handleTapDigit: (value: number) => void;
  selectedDigit: number | null;
};

const MinigameKeyboard: FC<MinigameKeyboardProps> = ({
  handleDrop,
  exercisePositions,
  handleTapDigit,
  selectedDigit,
}) => {
  const handleDragEnd: (
    value: number,
    gestureState: PanResponderGestureState,
  ) => void = useCallback(
    (value, gestureState) => {
      const exerise = getClosestCell(
        gestureState.moveX,
        gestureState.moveY - 50,
        exercisePositions,
      );
      if (exerise) {
        handleDrop(exerise, value);
      }
    },
    [exercisePositions, handleDrop],
  );

  const handleDrag: (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => void = useCallback((_event, _gestureState) => {
    // console.log('drag', gestureState.moveX, gestureState.moveY);
  }, []);
  return (
    <DraggableKeyboard
      exercisePositions={exercisePositions}
      handleDrag={handleDrag}
      handleDragEnd={handleDragEnd}
      handleTapDigit={handleTapDigit}
      selectedDigit={selectedDigit}
    />
  );
};

export default MinigameKeyboard;
