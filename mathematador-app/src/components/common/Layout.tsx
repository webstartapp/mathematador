import { FC, JSX, ReactNode } from "react";
import { View, Animated } from "react-native";

import { layoutStyles as styles } from "@/theme";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }): JSX.Element => {
  return (
    <View style={styles.fixed}>
      <Animated.ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.container}
      >
        <View style={styles.container}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
};

export default Layout;
