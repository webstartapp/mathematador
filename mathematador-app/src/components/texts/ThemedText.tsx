import { ReactNode } from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

const applyStylesFN = <T extends string>(
  styles: Record<T, TextStyle>,
): Record<T, TextStyle> => styles;

const themedStyles = applyStylesFN({
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  description: {
    color: "#333",
    fontSize: 14,
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
