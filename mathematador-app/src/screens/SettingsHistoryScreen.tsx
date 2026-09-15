import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import SettingHistoryRow from "@/components/common/SettingHistoryRow";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import ThemedText from "@/components/texts/ThemedText";
import {
  HistoryLoadState,
  useSettingsHistoryPage,
} from "@/hooks/useSettingsHistoryPage";
import { UserSetting } from "@/src/_generated/model";
import { colors, settingsHistoryScreenStyles as styles } from "@/theme";
import { RootStackParamList } from "@/types/Navigation";

type SettingsHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SettingsHistory"
>;

const renderContent = (
  loadState: HistoryLoadState,
  entries: UserSetting[],
  currentDeviceId: string | null,
): JSX.Element => {
  if (loadState === "loading") {
    return (
      <ActivityIndicator
        size="large"
        color={colors.white}
        style={styles.loader}
      />
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

export default SettingsHistoryScreen;
