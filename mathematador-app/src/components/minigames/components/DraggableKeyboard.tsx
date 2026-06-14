import { FC } from "react";
import {
  GestureResponderEvent,
  PanResponderGestureState,
  StyleSheet,
  View,
} from "react-native";

import { DraggableKeyboardDigit } from "@/components/minigames/components/DraggableKeyboardDigit";
import { computePositionKey } from "@/components/minigames/helpers/computePositionKey";
import { useScreenSizes } from "@/src/hooks/useScreenSizes";
import { ExerciseInputPosition } from "@/src/types/Chalenge";

const styles = StyleSheet.create({
  draggableWrapper: {
    backgroundColor: "#d49b57",
    borderWidth: 5,
    borderColor: "#744b17",
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
  },
  keyboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "100%",
    height: "100%",
    gap: 0,
  },
});

const digits = Array.from({ length: 10 }, (_ignored, index) =>
  index === 9 ? 0 : index + 1,
);

type DraggableKeyboardProps = {
  exercisePositions: ExerciseInputPosition[];
  handleDragEnd: (
    value: number,
    gestureState: PanResponderGestureState,
  ) => void;
  handleDrag: (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => void;
};

const DraggableKeyboard: FC<DraggableKeyboardProps> = ({
  exercisePositions,
  handleDragEnd,
  handleDrag,
}) => {
  const { secondarySize, orientation } = useScreenSizes(75);
  const minSizePortrait = Math.min(
    secondarySize.width / 5,
    secondarySize.height / 2,
  );
  const minSizeLandscape = secondarySize.height / 5;
  const digitSize =
    orientation === "landscape" ? minSizeLandscape : minSizePortrait;
  return (
    <View style={styles.keyboardContainer}>
      {digits.map((digit) => (
        <View
          key={`${digit}_${computePositionKey(exercisePositions)}`}
          style={{
            ...styles.draggableWrapper,
            width: orientation !== "landscape" ? digitSize : "50%",
            height: orientation === "landscape" ? digitSize : "50%",
            flexBasis: orientation !== "landscape" ? "20%" : "50%",
          }}
        >
          <DraggableKeyboardDigit
            renderText={String(digit)}
            digitSize={digitSize}
            onDragRelease={(_event, gestureState) =>
              handleDragEnd(digit, gestureState)
            }
            onDrag={handleDrag}
          />
        </View>
      ))}
    </View>
  );
};

export default DraggableKeyboard;
