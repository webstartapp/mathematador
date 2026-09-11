import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { JSX } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import Markdown from "react-native-markdown-display";

import imageBG from "@/assets/images/intro-screen.png";
import Button from "@/components/common/Button";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import ThemedText from "@/components/texts/ThemedText";
import { pagesBySlug } from "@/content/pages";
import { createTextShadow } from "@/helpers/createTextShadow";

const InfoPageScreen = (): JSX.Element => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const page = slug ? pagesBySlug[slug] : undefined;

  const handleBackToGame = (): void => {
    router.push("/");
  };

  return (
    <ImageBackground
      source={imageBG}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stack.Screen options={{ title: page ? page.title : "Not Found" }} />
        <CenteredDesk
          title={page ? page.title : "Page Not Found"}
          styles={{ container: styles.card }}
        >
          {page ? (
            <>
              <Markdown style={markdownStyles}>{page.markdownContent}</Markdown>
              <ThemedText variant="description" style={styles.updatedAt}>
                Last updated: {new Date(page.updatedAt).toLocaleDateString()}
              </ThemedText>
            </>
          ) : (
            <ThemedText variant="description" style={styles.description}>
              There&apos;s no page at this address.
            </ThemedText>
          )}
          <Button title="Back to game" onPress={handleBackToGame} />
        </CenteredDesk>
      </ScrollView>
    </ImageBackground>
  );
};

export default InfoPageScreen;

// Same recipe CenteredDesk.tsx already uses for its own title/description
// text on this exact tan/gold card (#d49b57) - not decorative flourish: flat
// white-on-#d49b57 measures ~2.4:1 contrast (WCAG AA needs 4.5:1 for body
// text), and this black halo is what actually makes it legible. Confirmed
// live - dropping it (an earlier version of this file did, reasoning a
// heavy shadow would hurt long-form readability) made the page hard to
// read, backwards from the intent.
const cardTextShadow = createTextShadow("black", 2, 2, 5);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    alignItems: "center",
    padding: 24,
  },
  card: {
    maxWidth: 720,
    padding: 20,
    marginVertical: 40,
  },
  description: {
    textAlign: "center",
    ...cardTextShadow,
  },
  updatedAt: {
    color: "#fff",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 12,
    marginBottom: 8,
    ...cardTextShadow,
  },
});

type MarkdownStyleMap = Record<string, TextStyle | ViewStyle>;

// react-native-markdown-display walks ancestor node styles for any property
// declared in its own `textStyleProps` list (color, fontSize, and - on
// native - the textShadow* triplet) and applies the nearest ancestor's
// value down to every text leaf. Declaring color/size/shadow once on `body`
// (its synthetic root ancestor of the whole document) is enough for it to
// reach every heading, list item, table cell, and link below - no need to
// repeat it per key. The triplet form is used here rather than
// createTextShadow()'s web-only unified `textShadow` string specifically
// because this inheritance mechanism (and real React Native, as opposed to
// react-native-web) only recognizes the triplet - see createTextShadow.ts's
// own comment on the split. react-native-web still renders the shadow from
// the triplet, just with a harmless deprecation warning in the console.
const markdownStyles: MarkdownStyleMap = {
  body: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textShadowColor: "black",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  heading1: { fontSize: 22, marginTop: 18, marginBottom: 8 },
  heading2: { fontSize: 20, marginTop: 16, marginBottom: 8 },
  heading3: { fontSize: 18, marginTop: 14, marginBottom: 6 },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },
  link: { textDecorationLine: "underline" },
  hr: { backgroundColor: "#B47b37" },
  table: { borderColor: "#B47b37" },
  thead: { borderColor: "#B47b37" },
  tr: { borderColor: "#B47b37" },
  th: { borderColor: "#B47b37" },
  td: { borderColor: "#B47b37" },
  blockquote: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: "#B47b37",
  },
  code_inline: { color: "#1a1a1a" },
  code_block: { color: "#1a1a1a" },
  fence: { color: "#1a1a1a" },
};
