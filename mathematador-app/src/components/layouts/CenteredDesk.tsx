import { FC, ReactNode } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import {
  cardTextShadow,
  colors,
  spacing,
  typography,
  usageStyles,
} from "@/theme";

const localStyles = StyleSheet.create({
  container: {
    ...usageStyles.woodPanel,
    color: colors.white,
    width: "100%",
  },
  wrapper: {},
  title: {
    fontSize: typography.size.hero,
    marginBottom: spacing.sm,
    color: colors.white,
    ...cardTextShadow,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.xxs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "center",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  description: {
    fontSize: typography.size.lg,
    marginBottom: spacing.xxs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "justify",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
});

type CenteredDeskStyleOverrides = Partial<{
  wrapper: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  description: TextStyle;
}>;

const CenteredDesk: FC<{
  title: string;
  subtitles?: string[];
  descriptions?: string[];
  children?: ReactNode;
  styles?: CenteredDeskStyleOverrides;
}> = ({ title, subtitles, descriptions, children, styles }) => {
  return (
    <View style={[localStyles.wrapper, styles?.wrapper]}>
      <View style={[localStyles.container, styles?.container]}>
        <ThemedText variant="title" style={[localStyles.title, styles?.title]}>
          {title}
        </ThemedText>
        {subtitles?.map((subtitle, index) => (
          <ThemedText
            key={`subtitles_key${index}`}
            variant="subtitle"
            style={[localStyles.subtitle, styles?.subtitle]}
          >
            {subtitle}
          </ThemedText>
        ))}
        {descriptions?.map((description, index) => (
          <ThemedText
            key={`descriptions_key${index}`}
            variant="description"
            style={[localStyles.description, styles?.description]}
          >
            {description}
          </ThemedText>
        ))}
        {children}
      </View>
    </View>
  );
};

export default CenteredDesk;
