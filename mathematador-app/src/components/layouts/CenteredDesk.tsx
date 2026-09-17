import { FC, ReactNode } from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { styles as themeStyles } from "@/theme";

// Not its own flat "container" key in theme.ts - this is styles.woodPanel
// (the shared wood-card chrome) plus this one override, composed here
// rather than duplicating woodPanel's fields under a new name. Kept as a
// style array (not an object spread) - StyleSheet.create's results can be
// opaque native identifiers rather than plain objects, so spreading one
// into a new object can silently drop all its fields on native. (The
// original also set `color: colors.white` here, but `color` isn't a
// valid View style - a harmless no-op on the <View> below, dropped now
// that this is an explicitly-typed ViewStyle rather than a loosely
// inferred StyleSheet.create entry.)
const containerStyleOverride: ViewStyle = {
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
  // Optional - a screen with its own top ScreenHeader (e.g.
  // SettingsScreen) passes no title here, since the header already shows
  // it; every other caller still passes one to render as this card's own
  // heading.
  title?: string;
  subtitles?: string[];
  descriptions?: string[];
  children?: ReactNode;
  styles?: CenteredDeskStyleOverrides;
}> = ({ title, subtitles, descriptions, children, styles }) => {
  return (
    <View style={[themeStyles.centeredDeskWrapper, styles?.wrapper]}>
      <View
        style={[
          themeStyles.woodPanel,
          containerStyleOverride,
          styles?.container,
        ]}
      >
        {title && (
          <ThemedText
            variant="title"
            style={[themeStyles.centeredDeskTitle, styles?.title]}
          >
            {title}
          </ThemedText>
        )}
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
