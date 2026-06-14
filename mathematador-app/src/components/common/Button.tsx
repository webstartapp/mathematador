import { FC, JSX } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

import ThemedText from "@/components/texts/ThemedText";

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
    backgroundColor: "#704c21",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
  },
  text: {},
});

export default Button;
