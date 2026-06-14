import { Link, Stack } from "expo-router";
import { JSX } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { ThemedView } from "@/src/components/ThemedView";

const NotFoundScreen = (): JSX.Element => {
  return (
    <View>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText variant="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText variant="description">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </View>
  );
};

export default NotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
