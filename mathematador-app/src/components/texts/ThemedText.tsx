import { ReactNode } from "react";
import { Text, TextProps } from "react-native";

import { themedTextVariants as variants } from "@/theme";

type Variant = keyof typeof variants;

const ThemedText = <T extends Variant>({
  variant,
  children,
  style,
  ...props
}: TextProps & {
  variant: T;
}): ReactNode => (
  <Text style={[variants[variant], style]} {...props}>
    {children}
  </Text>
);

export default ThemedText;
