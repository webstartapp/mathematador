import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import SettingHistoryRow from "@/components/common/SettingHistoryRow";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import {
  HistoryLoadState,
  useSettingsHistoryPage,
} from "@/hooks/useSettingsHistoryPage";
import { UserSetting } from "@/src/_generated/model";
import { RootStackParamList } from "@/types/Navigation";

type SettingsHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SettingsHistory"
>;

// Same recipe CenteredDesk.tsx/InfoPageScreen.tsx use for text on this
// exact tan/gold card (#d49b57) - the black halo is what makes flat
// white text legible on it.
const cardTextShadow = createTextShadow("black", 2, 2, 5);

const renderContent = (
  loadState: HistoryLoadState,
  entries: UserSetting[],
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

  if (entries.length === 0) {
    return (
      <ThemedText variant="description" style={styles.message}>
        No changes yet.
      </ThemedText>
    );
  }

  return (
    <>
      {entries.map((entry, index) => (
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
  const {
    loadState,
    entries,
    currentDeviceId,
    hasNextPage,
    isLoadingMore,
    loadMore,
  } = useSettingsHistoryPage();

  return (
    <Layout>
      <CenteredDesk title="Change History" styles={{ container: styles.card }}>
        <ScrollView
          style={styles.historyList}
          contentContainerStyle={styles.historyListContent}
        >
          {renderContent(loadState, entries, currentDeviceId)}
          {hasNextPage && (
            <Button
              title={isLoadingMore ? "Loading..." : "Load More"}
              onPress={loadMore}
              style={styles.loadMoreButton}
            />
          )}
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
  loadMoreButton: {
    marginTop: 4,
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
