import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { Text } from "react-native";

import imageBG from "@/assets/images/screen-bg-public.png";
import Layout from "@/components/common/Layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { styles } from "@/theme";
import { RootStackParamList } from "@/types/Navigation";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

// Empty on purpose - see issue #85 for the real level/XP/coins/cosmetics
// content. This exists so the new icon-driven main menu's profile icon
// (#82) has a real screen to navigate to instead of a dead route.
const ProfileScreen = (): JSX.Element => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <Layout>
      <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
      <CenteredDesk styles={{ container: styles.screenCardMd }}>
        <Text style={styles.settingsSectionLabel}>Coming soon</Text>
      </CenteredDesk>
    </Layout>
  );
};

export default ProfileScreen;
