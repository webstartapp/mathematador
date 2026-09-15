import { JSX, useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { styles } from "@/theme";

const AUTO_DISMISS_DELAY_MS = 1500;

interface ComboPopupProps {
  comboText: string | null;
}

const ComboPopup = ({ comboText }: ComboPopupProps): JSX.Element => {
  const scaleValue = useSharedValue(0.4);
  const opacityValue = useSharedValue(0);
  const [displayText, setDisplayText] = useState<string | null>(null);

  useEffect(() => {
    if (comboText === null) {
      opacityValue.value = withTiming(0, { duration: 250 });
      return () => {};
    }
    setDisplayText(comboText);
    scaleValue.value = 0.4;
    opacityValue.value = withTiming(1, { duration: 120 });
    scaleValue.value = withSequence(
      withSpring(1.15, { damping: 6, stiffness: 180 }),
      withSpring(1, { damping: 8 }),
    );
    const dismissTimeoutId = setTimeout(() => {
      opacityValue.value = withTiming(0, { duration: 250 });
    }, AUTO_DISMISS_DELAY_MS);
    return () => clearTimeout(dismissTimeoutId);
  }, [comboText, opacityValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  if (displayText === null) {
    return <View />;
  }

  return (
    <Animated.View
      style={[
        styles.comboPopupOverlay,
        { pointerEvents: "none" },
        animatedStyle,
      ]}
    >
      <Text style={styles.comboPopupText}>{displayText}</Text>
    </Animated.View>
  );
};

export default ComboPopup;
