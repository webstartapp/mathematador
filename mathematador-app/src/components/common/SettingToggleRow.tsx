import { FC, JSX } from "react";
import { StyleSheet, Switch, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { cardTextShadow, colors, spacing } from "@/theme";

interface SettingToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}

const SettingToggleRow: FC<SettingToggleRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}): JSX.Element => {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <ThemedText variant="subtitle" style={styles.label}>
          {label}
        </ThemedText>
        {description && (
          <ThemedText variant="description" style={styles.description}>
            {description}
          </ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "rgba(255, 255, 255, 0.3)", true: colors.success }}
        thumbColor={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.wood.border,
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    textAlign: "left",
    ...cardTextShadow,
  },
  description: {
    color: colors.white,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },
});

export default SettingToggleRow;
