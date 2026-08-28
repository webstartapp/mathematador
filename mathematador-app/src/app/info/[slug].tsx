import { Link, Stack, useLocalSearchParams } from "expo-router";
import { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

const humanizeSlug = (slug: string): string =>
  slug
    .split("-")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const InfoPageScreen = (): JSX.Element => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const pageTitle = slug ? humanizeSlug(slug) : "Info";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: pageTitle }} />
      <Text style={styles.title}>{pageTitle}</Text>
      <Text style={styles.body}>
        Content for this page is coming soon - see issue #34 (CMS backend) and
        #35 (public info pages).
      </Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Back to game</Text>
      </Link>
    </View>
  );
};

export default InfoPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  body: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#744b17",
    borderRadius: 10,
  },
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
