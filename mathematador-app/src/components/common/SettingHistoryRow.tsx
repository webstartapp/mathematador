import { FC, JSX } from "react";
import { Text, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import {
  formatDeviceId,
  formatSettingChangedAt,
  formatSettingValue,
  SETTING_KEY_LABELS,
} from "@/helpers/settingLabels";
import { UserSetting } from "@/src/_generated/model";
import { settingHistoryRowStyles as styles } from "@/theme";

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

export default SettingHistoryRow;
