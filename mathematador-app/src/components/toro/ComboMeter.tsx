import { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

import {
  getNextComboMilestone,
  getPreviousComboMilestone,
} from "@/components/toro/comboMilestones";
import { colors, spacing } from "@/theme";

interface ComboMeterProps {
  streak: number;
}

const ComboMeter = ({ streak }: ComboMeterProps): JSX.Element => {
  if (streak === 0) {
    return <View />;
  }

  const previousMilestone = getPreviousComboMilestone(streak);
  const nextMilestone = getNextComboMilestone(streak);
  const milestoneSpan = nextMilestone - previousMilestone || 1;
  const progress = Math.min(1, (streak - previousMilestone) / milestoneSpan);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔥 Combo x{streak}</Text>
      <ProgressBar progress={progress} color="#FF6B35" style={styles.bar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  label: {
    color: "#FFB347",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.overlay.medium,
  },
});

export default ComboMeter;
