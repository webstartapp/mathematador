import { FC, JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import {
  formatDeviceId,
  formatSettingChangedAt,
  formatSettingValue,
  SETTING_KEY_LABELS,
} from "@/helpers/settingLabels";
import { UserSetting } from "@/src/_generated/model";
import { cardTextShadow, colors, spacing, typography } from "@/theme";

interface SettingHistoryRowProps {
  entry: UserSetting;
  currentDeviceId: string | null;
}

const SettingHistoryRow: FC<SettingHistoryRowProps> = ({
  entry,
  currentDeviceId,
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
        <Text style={styles.device}>
          {formatDeviceId(entry.deviceId, currentDeviceId)}
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
  date: {
    color: colors.white,
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },
  device: {
    color: colors.white,
    fontSize: typography.size.xs,
    marginTop: spacing.xxs,
    ...cardTextShadow,
  },
  value: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    ...cardTextShadow,
  },
});

export default SettingHistoryRow;
