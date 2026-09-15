import { Link, Stack } from "expo-router";
import { JSX } from "react";
import { View } from "react-native";

import ThemedText from "@/components/texts/ThemedText";
import { ThemedView } from "@/src/components/ThemedView";
import { notFoundScreenStyles as styles } from "@/theme";

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
