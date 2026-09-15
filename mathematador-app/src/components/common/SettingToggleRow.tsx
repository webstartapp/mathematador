import { FC, JSX } from "react";
import { StyleSheet, Switch, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";

// Same recipe CenteredDesk.tsx/InfoPageScreen.tsx use for text on this
// exact tan/gold card (#d49b57) - the black halo is what makes flat
// white text legible on it.
const rowTextShadow = createTextShadow("black", 2, 2, 5);

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
        trackColor={{ false: "rgba(255, 255, 255, 0.3)", true: "#4CD964" }}
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
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#B47b37",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    textAlign: "left",
    ...rowTextShadow,
  },
  description: {
    color: "#fff",
    marginTop: 4,
    ...rowTextShadow,
  },
});

export default SettingToggleRow;
