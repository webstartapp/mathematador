import { FC, JSX } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { colors, radii, spacing } from "@/theme";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: object;
  textStyle?: object;
}

const Button: FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
}): JSX.Element => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <ThemedText variant="title" style={[styles.text, textStyle]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Close to (but distinct from) colors.wood.dark - the same near-brown
    // used independently in AuthScreen.tsx/ConsentScreen.tsx for solid CTA
    // buttons, unified onto the one wood-family token.
    backgroundColor: colors.wood.dark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  text: {},
});

export default Button;
