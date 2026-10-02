import { JSX, useEffect } from "react";
import { Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import boyFailureImage from "@/assets/images/character-boy-failure.png";
import boySuccessImage from "@/assets/images/character-boy-success.png";
import bullNeutralImage from "@/assets/images/character-bull-standing.png";
import bullSuccessImage from "@/assets/images/character-bull-success.png";
import { styles } from "@/theme";

export type CharacterReactionVariant = "success" | "failure";

interface CharacterReactionProps {
  variant: CharacterReactionVariant;
}

// Bull has no dedicated "sad" pose - the checkpoint that generated the
// pose set has a strong "warm smile" bias baked into its base description
// that repeatedly resisted a sad expression (see
// assets/working/comfy-workflows/mathematador-characters.json's note).
// Falls back to the neutral standing pose for the failure variant instead.
const CharacterReaction = ({
  variant,
}: CharacterReactionProps): JSX.Element => {
  const scaleValue = useSharedValue(0.4);
  const opacityValue = useSharedValue(0);

  useEffect(() => {
    scaleValue.value = 0.4;
    opacityValue.value = withTiming(1, { duration: 150 });
    scaleValue.value = withSequence(
      withSpring(1.1, { damping: 6, stiffness: 180 }),
      withSpring(1, { damping: 8 }),
    );
  }, [variant, opacityValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const boyImage = variant === "success" ? boySuccessImage : boyFailureImage;
  const bullImage = variant === "success" ? bullSuccessImage : bullNeutralImage;

  return (
    <Animated.View style={[styles.characterReactionRow, animatedStyle]}>
      <Image
        source={boyImage}
        style={styles.characterReactionImage}
        resizeMode="contain"
      />
      <Image
        source={bullImage}
        style={styles.characterReactionImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default CharacterReaction;
