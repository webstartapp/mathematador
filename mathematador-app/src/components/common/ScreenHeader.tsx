import { Ionicons } from "@expo/vector-icons";
import { FC, JSX, ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { colors, styles } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}

// Back arrow + centered title + optional right-side slot (e.g. Tienda's
// coin counter) - was hand-rolled identically in Tienda/Gauntlet. When no
// `right` is passed, an equal-width spacer keeps the title centered
// instead of it drifting toward the back button.
const ScreenHeader: FC<ScreenHeaderProps> = ({
  title,
  onBack,
  right,
}): JSX.Element => (
  <View style={styles.screenHeader}>
    <TouchableOpacity style={styles.headerBackButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color={colors.white} />
    </TouchableOpacity>
    <ThemedText variant="title" style={styles.screenHeaderTitle}>
      {title}
    </ThemedText>
    {right ?? <View style={styles.screenHeaderRightSpacer} />}
  </View>
);

export default ScreenHeader;
