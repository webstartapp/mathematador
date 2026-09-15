import { FC, JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import {
  formatSettingChangedAt,
  formatSettingValue,
  SETTING_KEY_LABELS,
} from "@/helpers/settingLabels";
import { UserSetting } from "@/src/_generated/model";

interface SettingHistoryRowProps {
  entry: UserSetting;
}

const SettingHistoryRow: FC<SettingHistoryRowProps> = ({
  entry,
}): JSX.Element => {
  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <ThemedText variant="subtitle" style={styles.label}>
          {SETTING_KEY_LABELS[entry.settingKey]}
        </ThemedText>
        <Text style={styles.date}>
          {formatSettingChangedAt(entry.changedAt)}
        </Text>
      </View>
      <Text style={styles.value}>{formatSettingValue(entry.settingValue)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  },
  date: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default SettingHistoryRow;
