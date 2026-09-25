import { FC, ReactNode } from "react";
import { View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { styles } from "@/theme";

interface ListRowProps {
  label: string;
  accessory: ReactNode;
  children?: ReactNode;
}

// Shared row shell for SettingToggleRow/SettingHistoryRow - both wanted an
// identical outer row + text-container + label, differing only in their
// own secondary lines (`children`, e.g. a description or a date/device
// pair) and their right-side control (`accessory`, e.g. a Switch or a
// plain value Text).
const ListRow: FC<ListRowProps> = ({ label, accessory, children }) => (
  <View style={styles.listRow}>
    <View style={styles.listRowTextContainer}>
      <ThemedText variant="subtitle" style={styles.listRowLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
    {accessory}
  </View>
);

export default ListRow;
