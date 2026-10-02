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
// instead of it drifting toward the back button. The title itself is a
// separate absolutely-positioned layer (screenHeaderTitleWrap), not a
// flex:1 sibling of the back button/right slot - those two rarely match
// widths (Tienda's coin pill is wider than the back button), which would
// otherwise center the title in the leftover space instead of the
// header's true center. pointerEvents="none" on that layer lets touches
// pass through to the back button/right slot underneath it.
const ScreenHeader: FC<ScreenHeaderProps> = ({
  title,
  onBack,
  right,
}): JSX.Element => (
  <View style={styles.screenHeader}>
    <TouchableOpacity
      style={styles.headerBackButton}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={24} color={colors.white} />
    </TouchableOpacity>
    <View style={styles.screenHeaderTitleWrap} pointerEvents="none">
      <ThemedText variant="title" style={styles.screenHeaderTitle}>
        {title}
      </ThemedText>
    </View>
    {right ?? <View style={styles.screenHeaderRightSpacer} />}
  </View>
);

export default ScreenHeader;
