import { FC, JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import {
  formatDeviceId,
  formatSettingChangedAt,
  formatSettingValue,
  SETTING_KEY_LABELS,
} from "@/helpers/settingLabels";
import { UserSetting } from "@/src/_generated/model";

// Same recipe CenteredDesk.tsx/InfoPageScreen.tsx use for text on this
// exact tan/gold card (#d49b57) - the black halo is what makes flat
// white text legible on it.
const rowTextShadow = createTextShadow("black", 2, 2, 5);

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
  date: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    ...rowTextShadow,
  },
  device: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
    ...rowTextShadow,
  },
  value: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    ...rowTextShadow,
  },
});

export default SettingHistoryRow;
