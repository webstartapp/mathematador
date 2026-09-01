import { FC, ReactNode } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";

const bodyTextShadow = createTextShadow("black", 2, 2, 5);

const localStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: "#E4Ab67",
    borderWidth: 5,
    backgroundColor: "#d49b57",
    color: "#fff",
    width: "100%",
    boxShadow: [{ offsetX: 2, offsetY: 2, blurRadius: 0, color: "#B47b37" }],
  },
  wrapper: {},
  title: {
    fontSize: 30,
    marginBottom: 10,
    color: "white",
    ...bodyTextShadow,
    paddingLeft: 10,
    paddingRight: 10,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 5,
    color: "white",
    ...bodyTextShadow,
    textAlign: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 5,
    color: "white",
    ...bodyTextShadow,
    textAlign: "justify",
    paddingLeft: 10,
    paddingRight: 10,
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
