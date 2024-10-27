import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Animated.ScrollView
      style={styles.scroller}
      contentContainerStyle={styles.container}
    >
      <View style={styles.container}>{children}</View>
      </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  scroller: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default Layout;
