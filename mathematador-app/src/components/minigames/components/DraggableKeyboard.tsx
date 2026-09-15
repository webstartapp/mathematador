import { FC } from "react";
import {
  GestureResponderEvent,
  PanResponderGestureState,
  View,
} from "react-native";

import { DraggableKeyboardDigit } from "@/components/minigames/components/DraggableKeyboardDigit";
import { computePositionKey } from "@/components/minigames/helpers/computePositionKey";
import { useScreenSizes } from "@/src/hooks/useScreenSizes";
import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { styles } from "@/theme";

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
  handleTapDigit: (value: number) => void;
  selectedDigit: number | null;
};

const DraggableKeyboard: FC<DraggableKeyboardProps> = ({
  exercisePositions,
  handleDragEnd,
  handleDrag,
  handleTapDigit,
  selectedDigit,
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
    <View style={styles.draggableKeyboardContainer}>
      {digits.map((digit) => (
        <View
          key={`${digit}_${computePositionKey(exercisePositions)}`}
          style={{
            ...styles.draggableKeyboardWrapper,
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
            onTap={() => handleTapDigit(digit)}
            isSelected={selectedDigit === digit}
          />
        </View>
      ))}
    </View>
  );
};

export default DraggableKeyboard;
