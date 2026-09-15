import { JSX, type PropsWithChildren } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import { ThemedView } from "@/src/components/ThemedView";
import { parallaxScrollViewStyles as styles } from "@/theme";

type Props = PropsWithChildren;

const ParallaxScrollView = ({ children }: Props): JSX.Element => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
};

export default ParallaxScrollView;
