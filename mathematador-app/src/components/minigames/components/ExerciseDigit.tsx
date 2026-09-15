import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { styles } from "@/theme";

export type ExerciseDigitProps = {
  value?: string;
  updateExercisePositions?: (
    exercisePositions: ExerciseInputPosition[],
    exerciseId: number,
  ) => void;
  exercisePositions?: ExerciseInputPosition[];
  forwardRef?: (ref: View | null) => void;
  exerciseId: number;
  isUnknown?: boolean;
  onPress?: () => void;
  isTargetable?: boolean;
};

const ExeriseDigit: FC<ExerciseDigitProps> = ({
  value,
  forwardRef,
  isUnknown,
  onPress,
  isTargetable,
}) => {
  const containerStyle = [
    isUnknown
      ? styles.exerciseDigitUnknownContainer
      : styles.exerciseDigitContainer,
    isTargetable ? styles.exerciseDigitTargetable : null,
  ];
  const digitContent = (
    <View
      style={containerStyle}
      ref={(refI) => {
        if (forwardRef) forwardRef(refI);
      }}
    >
      <Text
        style={
          isUnknown ? styles.exerciseDigitUnknownText : styles.exerciseDigitText
        }
      >
        {value || "?"}
      </Text>
    </View>
  );

  if (!onPress) {
    return digitContent;
  }

  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      {digitContent}
    </TouchableOpacity>
  );
};

export default ExeriseDigit;
