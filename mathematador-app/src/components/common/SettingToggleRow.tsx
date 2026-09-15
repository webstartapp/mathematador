import { FC, JSX } from "react";
import { Switch, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { colors, settingToggleRowStyles as styles } from "@/theme";

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

export default SettingToggleRow;
