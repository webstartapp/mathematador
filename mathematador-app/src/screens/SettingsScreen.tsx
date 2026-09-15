import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import SettingToggleRow from "@/components/common/SettingToggleRow";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { createTextShadow } from "@/helpers/createTextShadow";
import { useUpdateUserSetting } from "@/hooks/useSyncUserSettings";
import { setMusicEnabled, setSoundEnabled } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import { RootStackParamList } from "@/types/Navigation";

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
      <CenteredDesk title="Settings" styles={{ container: styles.card }}>
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

        <Button
          title="View Change History"
          onPress={() => navigation.navigate("SettingsHistory")}
          style={styles.historyButton}
          textStyle={styles.historyButtonText}
        />
        <Button title="Back to Home" onPress={() => navigation.goBack()} />
      </CenteredDesk>
    </Layout>
  );
};

// Same recipe CenteredDesk.tsx already uses for its own title/description
// text on this exact tan/gold card (#d49b57) - flat white-on-#d49b57 alone
// doesn't meet contrast guidelines, the black halo is what makes it legible
// (see InfoPageScreen.tsx, which established this pattern first).
const cardTextShadow = createTextShadow("black", 2, 2, 5);

const styles = StyleSheet.create({
  card: {
    maxWidth: 480,
    padding: 20,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginTop: 12,
    marginBottom: 8,
    ...cardTextShadow,
  },
  historyButton: {
    backgroundColor: "#FFD700",
    marginTop: 16,
  },
  historyButtonText: {
    color: "#1a1a1a",
  },
});

export default SettingsScreen;
