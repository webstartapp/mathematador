import { ReactNode } from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

import { colors, typography } from "@/theme";

const applyStylesFN = <T extends string>(
  styles: Record<T, TextStyle>,
): Record<T, TextStyle> => styles;

const themedStyles = applyStylesFN({
  title: {
    color: colors.white,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  subtitle: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  description: {
    color: "#333",
    fontSize: typography.size.base,
  },
});
const alternativeStyles = applyStylesFN({
  // darkTitle: {
  //     ...themedStyles.title,
  //     color: '#000',
  // },
  // darkLabel: {
  //     ...themedStyles.label,
  //     color: '#000',
  // },
  // darkDescription: {
  //     ...themedStyles.description,
  //     color: '#000',
  // },
});

const styleVariants = {
  ...themedStyles,
  ...alternativeStyles,
};

const variants = StyleSheet.create(styleVariants);

type Variant = keyof typeof styleVariants;

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
