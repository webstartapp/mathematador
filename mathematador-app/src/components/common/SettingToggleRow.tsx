import { FC, JSX } from "react";
import { StyleSheet, Switch, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";

const labelTextShadow = createTextShadow("rgba(0, 0, 0, 0.8)", 1, 1, 4);

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
        trackColor={{ false: "rgba(255, 255, 255, 0.2)", true: "#FFD700" }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Dark (not light) translucent fill - a light tint barely registers
    // against this screen's bright background artwork (the same intro
    // image Home uses), where a dark one gives real contrast regardless
    // of what's directly behind it.
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    textAlign: "left",
    ...labelTextShadow,
  },
  description: {
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 4,
    ...labelTextShadow,
  },
});

export default SettingToggleRow;
