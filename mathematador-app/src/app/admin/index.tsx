import { Stack } from "expo-router";
import { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

import RequireAdmin from "@/components/auth/RequireAdmin";

const AdminScreen = (): JSX.Element => {
  return (
    <RequireAdmin>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Admin" }} />
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.body}>
          Authentication (issue #30) is enforced here now - only signed-in
          admins reach this page. The actual page-management UI (issue #36)
          isn&apos;t built yet.
        </Text>
      </View>
    </RequireAdmin>
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
