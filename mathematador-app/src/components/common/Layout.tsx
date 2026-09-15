import { FC, JSX, ReactNode } from "react";
import { View, Animated } from "react-native";

import { styles } from "@/theme";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }): JSX.Element => {
  return (
    <View style={styles.layoutFixed}>
      <Animated.ScrollView
        style={styles.layoutScroller}
        contentContainerStyle={styles.layoutContainer}
      >
        <View style={styles.layoutContainer}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
};

export default Layout;
