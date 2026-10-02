import { FC, ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { styles } from "@/theme";

interface CardProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

// The translucent-overlay card family (Gauntlet's panels, Tienda's
// cosmetic cards) - as opposed to CenteredDesk's wood-panel family, which
// stays a separate component since the two look deliberately different.
const Card: FC<CardProps> = ({ style, children }) => (
  <View style={[styles.overlayCardSubtle, styles.cardDropShadow, style]}>
    {children}
  </View>
);

export default Card;
