import { JSX, useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const PARTICLE_COUNT = 14;
const PARTICLE_EMOJIS = ["🌸", "🪙", "🌺", "🪙", "✨"];
const FALL_DISTANCE = 520;

interface ParticleProps {
  emoji: string;
  leftPosition: number;
  delayMillis: number;
}

const Particle = ({
  emoji,
  leftPosition,
  delayMillis,
}: ParticleProps): JSX.Element => {
  const translateValue = useSharedValue(-40);
  const opacityValue = useSharedValue(0);

  useEffect(() => {
    opacityValue.value = withDelay(
      delayMillis,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 }),
      ),
    );
    translateValue.value = withDelay(
      delayMillis,
      withTiming(FALL_DISTANCE, { duration: 1400 }),
    );
  }, [delayMillis, opacityValue, translateValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ translateY: translateValue.value }],
  }));

  return (
    <Animated.Text
      style={[styles.particle, { left: leftPosition }, animatedStyle]}
    >
      {emoji}
    </Animated.Text>
  );
};

interface ComboRewardBurstProps {
  burstKey: number;
}

const ComboRewardBurst = ({ burstKey }: ComboRewardBurstProps): JSX.Element => {
  const [activeKey, setActiveKey] = useState(0);

  useEffect(() => {
    if (burstKey === 0) {
      return () => {};
    }
    setActiveKey(burstKey);
    const timeoutId = setTimeout(() => setActiveKey(0), 1800);
    return () => clearTimeout(timeoutId);
  }, [burstKey]);

  const particles = useMemo(() => {
    if (activeKey === 0) {
      return [];
    }
    const screenWidth = Dimensions.get("window").width;
    return Array.from(
      { length: PARTICLE_COUNT },
      (_unusedValue, particleIndex) => ({
        particleKey: `${activeKey}-${particleIndex}`,
        emoji: PARTICLE_EMOJIS[particleIndex % PARTICLE_EMOJIS.length],
        leftPosition: Math.random() * Math.max(0, screenWidth - 30),
        delayMillis: Math.random() * 300,
      }),
    );
  }, [activeKey]);

  if (particles.length === 0) {
    return <View />;
  }

  return (
    <View style={[styles.overlay, { pointerEvents: "none" }]}>
      {particles.map((particleItem) => (
        <Particle
          key={particleItem.particleKey}
          emoji={particleItem.emoji}
          leftPosition={particleItem.leftPosition}
          delayMillis={particleItem.delayMillis}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  particle: {
    position: "absolute",
    top: 0,
    fontSize: 26,
  },
});

export default ComboRewardBurst;
