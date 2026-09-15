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
import { styles } from "@/theme";

interface SettingHistoryRowProps {
  entry: UserSetting;
  currentDeviceId: string | null;
}

const SettingHistoryRow: FC<SettingHistoryRowProps> = ({
  entry,
  currentDeviceId,
}): JSX.Element => {
  return (
    <View style={styles.settingHistoryRow}>
      <View style={styles.settingHistoryTextContainer}>
        <ThemedText variant="subtitle" style={styles.settingHistoryLabel}>
          {SETTING_KEY_LABELS[entry.settingKey]}
        </ThemedText>
        <Text style={styles.settingHistoryDate}>
          {formatSettingChangedAt(entry.changedAt)}
        </Text>
        <Text style={styles.settingHistoryDevice}>
          {formatDeviceId(entry.deviceId, currentDeviceId)}
        </Text>
      </View>
      <Text style={styles.settingHistoryValue}>
        {formatSettingValue(entry.settingValue)}
      </Text>
    </View>
  );
};

export default SettingHistoryRow;
