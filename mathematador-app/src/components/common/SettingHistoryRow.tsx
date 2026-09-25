import { FC, JSX } from "react";
import { Text } from "react-native";

import ListRow from "@/components/common/ListRow";
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
    <ListRow
      label={SETTING_KEY_LABELS[entry.settingKey]}
      accessory={
        <Text style={styles.settingHistoryValue}>
          {formatSettingValue(entry.settingValue)}
        </Text>
      }
    >
      <Text style={styles.settingHistoryDate}>
        {formatSettingChangedAt(entry.changedAt)}
      </Text>
      <Text style={styles.settingHistoryDevice}>
        {formatDeviceId(entry.deviceId, currentDeviceId)}
      </Text>
    </ListRow>
  );
};

export default SettingHistoryRow;
