import { Stack } from "expo-router";
import { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

const AdminScreen = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Admin" }} />
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.body}>
        This route is not access-controlled yet - authentication (issue #30) and
        the actual page-management UI (issue #36) aren't built. Anyone can reach
        this URL for now.
      </Text>
    </View>
  );
};

export default AdminScreen;

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
  },
});
