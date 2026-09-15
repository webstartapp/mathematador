import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Layout from "@/components/common/Layout";
import SettingHistoryRow from "@/components/common/SettingHistoryRow";
import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import { userSettingsGetHistory } from "@/src/_generated/api";
import { UserSetting } from "@/src/_generated/model";
import { RootStackParamList } from "@/types/Navigation";

const headerTextShadow = createTextShadow("rgba(0, 0, 0, 0.8)", 1, 1, 5);

type SettingsHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SettingsHistory"
>;

type LoadState = "loading" | "loaded" | "error";

const renderContent = (
  loadState: LoadState,
  history: UserSetting[],
): JSX.Element => {
  if (loadState === "loading") {
    return (
      <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
    );
  }

  if (loadState === "error") {
    return (
      <Text style={styles.emptyText}>
        Could not load your change history. Please try again later.
      </Text>
    );
  }

  if (history.length === 0) {
    return <Text style={styles.emptyText}>No changes yet.</Text>;
  }

  return (
    <>
      {history.map((entry, index) => (
        <SettingHistoryRow
          key={`${entry.settingKey}_${entry.changedAt}_${index}`}
          entry={entry}
        />
      ))}
    </>
  );
};

const SettingsHistoryScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsHistoryScreenNavigationProp>();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [history, setHistory] = useState<UserSetting[]>([]);

  useEffect(() => {
    let isCancelled = false;
    userSettingsGetHistory()
      .then((response) => {
        if (isCancelled) return;
        setHistory(response?.data ?? []);
        setLoadState("loaded");
      })
      .catch(() => {
        // Unlike the current-settings screen, there's no sensible local
        // fallback for a change log - show a real error instead of
        // silently rendering stale/fabricated data.
        if (!isCancelled) setLoadState("error");
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <Layout>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText variant="title" style={styles.title}>
          Change History
        </ThemedText>
        <View style={styles.backBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderContent(loadState, history)}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    width: "100%",
  },
  backBtn: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
    ...headerTextShadow,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    ...headerTextShadow,
  },
});

export default SettingsHistoryScreen;
