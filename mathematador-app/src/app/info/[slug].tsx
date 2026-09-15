import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { JSX } from "react";
import { ImageBackground, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";

import imageBG from "@/assets/images/intro-screen.png";
import Button from "@/components/common/Button";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import ThemedText from "@/components/texts/ThemedText";
import { pagesBySlug } from "@/content/pages";
import { styles } from "@/theme";

// react-native-markdown-display's `style` prop needs this exact shape
// (body/heading1/.../fence, its own naming, not renameable) - assembled
// here from theme.ts's flat infoPageMarkdown* keys rather than each of
// those being its own StyleSheet.create call.
const markdownStyles = {
  body: styles.infoPageMarkdownBody,
  heading1: styles.infoPageMarkdownHeading1,
  heading2: styles.infoPageMarkdownHeading2,
  heading3: styles.infoPageMarkdownHeading3,
  strong: styles.infoPageMarkdownStrong,
  em: styles.infoPageMarkdownEm,
  link: styles.infoPageMarkdownLink,
  hr: styles.infoPageMarkdownRule,
  table: styles.infoPageMarkdownTableBorder,
  thead: styles.infoPageMarkdownTableBorder,
  tr: styles.infoPageMarkdownTableBorder,
  th: styles.infoPageMarkdownTableBorder,
  td: styles.infoPageMarkdownTableBorder,
  blockquote: styles.infoPageMarkdownBlockquote,
  code_inline: styles.infoPageMarkdownCode,
  code_block: styles.infoPageMarkdownCode,
  fence: styles.infoPageMarkdownCode,
};

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
      style={styles.fullBleed}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.infoPageScrollContent}>
        <Stack.Screen options={{ title: page ? page.title : "Not Found" }} />
        <CenteredDesk
          title={page ? page.title : "Page Not Found"}
          styles={{ container: styles.infoPageCard }}
        >
          {page ? (
            <>
              <Markdown style={markdownStyles} onLinkPress={handleLinkPress}>
                {page.markdownContent}
              </Markdown>
              <ThemedText
                variant="description"
                style={styles.infoPageUpdatedAt}
              >
                Last updated:{" "}
                {new Date(page.updatedAt).toLocaleDateString(undefined, {
                  timeZone: "UTC",
                })}
              </ThemedText>
            </>
          ) : (
            <ThemedText
              variant="description"
              style={styles.infoPageDescription}
            >
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
