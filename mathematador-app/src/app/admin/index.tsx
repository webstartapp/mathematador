import { Stack } from "expo-router";
import { JSX } from "react";
import { Text, View } from "react-native";

import RequireAdmin from "@/components/auth/RequireAdmin";
import { adminScreenStyles as styles } from "@/theme";

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
