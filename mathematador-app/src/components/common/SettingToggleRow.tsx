import { FC, JSX } from "react";
import { Switch } from "react-native";

import ListRow from "@/components/common/ListRow";
import ThemedText from "@/components/texts/ThemedText";
import { colors, styles } from "@/theme";

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
    <ListRow
      label={label}
      accessory={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: "rgba(255, 255, 255, 0.3)",
            true: colors.success,
          }}
          thumbColor={colors.white}
        />
      }
    >
      {description && (
        <ThemedText
          variant="description"
          style={styles.settingToggleDescription}
        >
          {description}
        </ThemedText>
      )}
    </ListRow>
  );
};

export default SettingToggleRow;
