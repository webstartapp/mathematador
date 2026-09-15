import { JSX } from "react";
import { Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

import {
  getNextComboMilestone,
  getPreviousComboMilestone,
} from "@/components/toro/comboMilestones";
import { comboMeterStyles as styles } from "@/theme";

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

export default ComboMeter;
