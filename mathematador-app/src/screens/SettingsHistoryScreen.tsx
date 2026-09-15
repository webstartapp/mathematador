import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import SettingHistoryRow from "@/components/common/SettingHistoryRow";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import { waitForPendingUserSettingsWrites } from "@/hooks/useSyncUserSettings";
import { userSettingsGetHistory } from "@/src/_generated/api";
import { UserSetting } from "@/src/_generated/model";
import { RootStackParamList } from "@/types/Navigation";
import { getOrCreateDeviceId } from "@/utils/consent";

type SettingsHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SettingsHistory"
>;

type LoadState = "loading" | "loaded" | "error";

// Same recipe CenteredDesk.tsx/InfoPageScreen.tsx use for text on this
// exact tan/gold card (#d49b57) - the black halo is what makes flat
// white text legible on it.
const cardTextShadow = createTextShadow("black", 2, 2, 5);

const renderContent = (
  loadState: LoadState,
  history: UserSetting[],
  currentDeviceId: string | null,
): JSX.Element => {
  if (loadState === "loading") {
    return (
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
    );
  }

  if (loadState === "error") {
    return (
      <ThemedText variant="description" style={styles.message}>
        Could not load your change history. Please try again later.
      </ThemedText>
    );
  }

  if (history.length === 0) {
    return (
      <ThemedText variant="description" style={styles.message}>
        No changes yet.
      </ThemedText>
    );
  }

  return (
    <>
      {history.map((entry, index) => (
        <SettingHistoryRow
          key={`${entry.settingKey}_${entry.changedAt}_${index}`}
          entry={entry}
          currentDeviceId={currentDeviceId}
        />
      ))}
    </>
  );
};

const SettingsHistoryScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsHistoryScreenNavigationProp>();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [history, setHistory] = useState<UserSetting[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    getOrCreateDeviceId()
      .then((deviceId) => {
        if (!isCancelled) setCurrentDeviceId(deviceId);
      })
      .catch(() => {
        // Rows just render their own device id instead of "This device".
      });
    // Wait for any still-queued toggle to actually reach the server first -
    // otherwise navigating here right after a toggle can have this GET race
    // that POST and render a history list missing the just-made change.
    waitForPendingUserSettingsWrites()
      .then(() => userSettingsGetHistory())
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
      <CenteredDesk title="Change History" styles={{ container: styles.card }}>
        <ScrollView
          style={styles.historyList}
          contentContainerStyle={styles.historyListContent}
        >
          {renderContent(loadState, history, currentDeviceId)}
        </ScrollView>
        <Button title="Back to Settings" onPress={() => navigation.goBack()} />
      </CenteredDesk>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    maxWidth: 480,
    padding: 20,
  },
  // Layout.tsx's own outer ScrollView constrains its content container to
  // height: "100%" rather than letting it grow, so it can't scroll content
  // taller than the viewport on its own (TiendaScreen works around the same
  // limitation with its own nested ScrollView) - bounded so a long history
  // list scrolls internally instead of clipping rows or pushing the Back
  // button off-screen.
  historyList: {
    maxHeight: 400,
    width: "100%",
  },
  historyListContent: {
    paddingBottom: 8,
  },
  loader: {
    marginVertical: 30,
  },
  message: {
    textAlign: "center",
    marginVertical: 20,
    ...cardTextShadow,
  },
});

export default SettingsHistoryScreen;
