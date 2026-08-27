import { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ExerciseInputPosition } from "@/src/types/Chalenge";

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
    isUnknown ? styles.unknownDigitContainer : styles.digitContainer,
    isTargetable ? styles.targetableDigitContainer : null,
  ];
  const digitContent = (
    <View
      style={containerStyle}
      ref={(refI) => {
        if (forwardRef) forwardRef(refI);
      }}
    >
      <Text style={isUnknown ? styles.unknownDigit : styles.digit}>
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

const styles = StyleSheet.create({
  unknownDigitContainer: {
    borderColor: "#FFFFFF",
    borderWidth: 5,
    backgroundColor: "#744b17",
    borderRadius: 4,
    padding: 5,
    margin: 2,
    minWidth: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  digitContainer: {
    borderColor: "#E4Ab67",
    borderWidth: 5,
    backgroundColor: "#d49b57",
    borderRadius: 4,
    padding: 5,
    margin: 2,
    minWidth: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  targetableDigitContainer: {
    borderColor: "#FFD700",
  },
  unknownDigit: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  digit: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ExeriseDigit;
