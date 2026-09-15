import { ReactNode } from "react";
import { Text, TextProps } from "react-native";

import { styles } from "@/theme";

// Maps this component's public `variant` prop values to their flat
// theme.ts keys - the prop names stay short/semantic ("title") while the
// single shared stylesheet's keys stay disambiguated ("themedTextTitle").
const VARIANT_STYLE_KEYS = {
  title: "themedTextTitle",
  subtitle: "themedTextSubtitle",
  description: "themedTextDescription",
} as const;

type Variant = keyof typeof VARIANT_STYLE_KEYS;

const ThemedText = <T extends Variant>({
  variant,
  children,
  style,
  ...props
}: TextProps & {
  variant: T;
}): ReactNode => (
  <Text style={[styles[VARIANT_STYLE_KEYS[variant]], style]} {...props}>
    {children}
  </Text>
);

export default ThemedText;
