import { FC, ReactNode } from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { styles as themeStyles } from "@/theme";

// Not its own flat "container" key in theme.ts - this is styles.woodPanel
// (the shared wood-card chrome) plus this one override, composed here
// rather than duplicating woodPanel's fields under a new name. (The
// original also set `color: colors.white` here, but `color` isn't a
// valid View style - a harmless no-op on the <View> below, dropped now
// that this is an explicitly-typed ViewStyle rather than a loosely
// inferred StyleSheet.create entry.)
const containerStyle: ViewStyle = {
  ...themeStyles.woodPanel,
  width: "100%",
};

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
    <View style={[themeStyles.centeredDeskWrapper, styles?.wrapper]}>
      <View style={[containerStyle, styles?.container]}>
        <ThemedText
          variant="title"
          style={[themeStyles.centeredDeskTitle, styles?.title]}
        >
          {title}
        </ThemedText>
        {subtitles?.map((subtitle, index) => (
          <ThemedText
            key={`subtitles_key${index}`}
            variant="subtitle"
            style={[themeStyles.centeredDeskSubtitle, styles?.subtitle]}
          >
            {subtitle}
          </ThemedText>
        ))}
        {descriptions?.map((description, index) => (
          <ThemedText
            key={`descriptions_key${index}`}
            variant="description"
            style={[themeStyles.centeredDeskDescription, styles?.description]}
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
