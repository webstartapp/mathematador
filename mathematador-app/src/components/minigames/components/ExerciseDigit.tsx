import { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { colors, spacing, typography, usageStyles } from "@/theme";

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
    ...usageStyles.woodTile,
    borderColor: colors.white,
    backgroundColor: colors.wood.dark,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  digitContainer: {
    ...usageStyles.woodTile,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  targetableDigitContainer: {
    borderColor: colors.gold,
  },
  unknownDigit: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
  digit: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
});

export default ExeriseDigit;
