import { FC, ReactNode } from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { centeredDeskStyles as localStyles } from "@/theme";

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
