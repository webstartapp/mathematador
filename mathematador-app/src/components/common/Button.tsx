import { FC, JSX } from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { styles } from "@/theme";

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
      <ThemedText variant="title" style={[styles.buttonText, textStyle]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default Button;
