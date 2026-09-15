import { FC, JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import {
  formatSettingChangedAt,
  formatSettingValue,
  SETTING_KEY_LABELS,
} from "@/helpers/settingLabels";
import { UserSetting } from "@/src/_generated/model";

const rowTextShadow = createTextShadow("rgba(0, 0, 0, 0.8)", 1, 1, 4);

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
    // Dark (not light) translucent fill - a light tint barely registers
    // against this screen's bright background artwork, where a dark one
    // gives real contrast regardless of what's directly behind it.
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
    ...rowTextShadow,
  },
  date: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    marginTop: 4,
    ...rowTextShadow,
  },
  value: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 14,
    ...rowTextShadow,
  },
});

export default SettingHistoryRow;
