import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/src/components/ThemedView';
import ThemedText from '../components/texts/ThemedText';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText variant="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText variant="description">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
