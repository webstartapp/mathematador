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
import { cardTextShadow, colors, spacing, typography } from "@/theme";

const InfoPageScreen = (): JSX.Element => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const page = slug ? pagesBySlug.get(slug) : undefined;

  const handleBackToGame = (): void => {
    router.push("/");
  };

  // react-native-markdown-display's default link handling always calls
  // Linking.openURL, which fails for a relative in-page link like
  // "/info/gdpr" (no scheme to open) instead of navigating there - route
  // same-app links through expo-router ourselves (returning false skips
  // the library's own Linking.openURL call) and let genuinely external
  // links (coi.gov.cz, policies.google.com, ...) fall through to it.
  const handleLinkPress = (href: string): boolean => {
    if (href.startsWith("/")) {
      router.push(href);
      return false;
    }
    return true;
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
              <Markdown style={markdownStyles} onLinkPress={handleLinkPress}>
                {page.markdownContent}
              </Markdown>
              <ThemedText variant="description" style={styles.updatedAt}>
                Last updated:{" "}
                {new Date(page.updatedAt).toLocaleDateString(undefined, {
                  timeZone: "UTC",
                })}
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    alignItems: "center",
    padding: spacing.xxl,
  },
  card: {
    maxWidth: 720,
    padding: spacing.xl,
    marginVertical: spacing.huge,
  },
  description: {
    textAlign: "center",
    ...cardTextShadow,
  },
  updatedAt: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontStyle: "italic",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
    color: colors.white,
    fontSize: typography.size.md,
    lineHeight: 24,
    textShadowColor: "black",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  heading1: {
    fontSize: typography.size.xxl,
    marginTop: 18,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: typography.size.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading3: { fontSize: typography.size.lg, marginTop: 14, marginBottom: 6 },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },
  link: { textDecorationLine: "underline" },
  hr: { backgroundColor: colors.wood.border },
  table: { borderColor: colors.wood.border },
  thead: { borderColor: colors.wood.border },
  tr: { borderColor: colors.wood.border },
  th: { borderColor: colors.wood.border },
  td: { borderColor: colors.wood.border },
  blockquote: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: colors.wood.border,
  },
  code_inline: { color: colors.nearBlack },
  code_block: { color: colors.nearBlack },
  fence: { color: colors.nearBlack },
};
