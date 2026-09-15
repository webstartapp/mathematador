import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Layout from "@/components/common/Layout";
import SettingToggleRow from "@/components/common/SettingToggleRow";
import ThemedText from "@/components/texts/ThemedText";
import { createTextShadow } from "@/helpers/createTextShadow";
import { useUpdateUserSetting } from "@/hooks/useSyncUserSettings";
import { setMusicEnabled, setSoundEnabled } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import { RootStackParamList } from "@/types/Navigation";

const headerTextShadow = createTextShadow("rgba(0, 0, 0, 0.8)", 1, 1, 5);

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

const SettingsScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const dispatch = useDispatch();
  const updateUserSetting = useUpdateUserSetting();

  const soundEnabled = useSelector(
    (state: RootState) => state.user.soundEnabled,
  );
  const musicEnabled = useSelector(
    (state: RootState) => state.user.musicEnabled,
  );
  const adsConsent = useSelector(
    (state: RootState) => state.settings.adsConsent,
  );
  const gdprConsent = useSelector(
    (state: RootState) => state.settings.gdprConsent,
  );

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
          Settings
        </ThemedText>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Device</Text>
        <SettingToggleRow
          label="Sound Effects"
          description="The Toro's ¡Ole! and other in-game sounds"
          // !== false (not the raw value): a device with app data persisted
          // before soundEnabled existed rehydrates with it simply absent -
          // undefined at runtime despite the boolean type - which should
          // display as the intended default (on), not as off. Same fix as
          // useOleSound.ts's playback guard.
          value={soundEnabled !== false}
          onValueChange={(next) => dispatch(setSoundEnabled(next))}
        />
        <SettingToggleRow
          label="Music"
          description="Menu background music"
          value={musicEnabled}
          onValueChange={(next) => dispatch(setMusicEnabled(next))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <SettingToggleRow
          label="Ads Consent"
          value={adsConsent}
          onValueChange={(next) => updateUserSetting("ads_consent", next)}
        />
        <SettingToggleRow
          label="GDPR Consent"
          value={gdprConsent}
          onValueChange={(next) => updateUserSetting("gdpr_consent", next)}
        />
      </View>

      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => navigation.navigate("SettingsHistory")}
      >
        <Text style={styles.historyLinkText}>View Change History</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFD700" />
      </TouchableOpacity>
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
  section: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
    ...headerTextShadow,
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  historyLinkText: {
    color: "#FFD700",
    fontWeight: "600",
    fontSize: 15,
    marginRight: 6,
    ...headerTextShadow,
  },
});

export default SettingsScreen;
