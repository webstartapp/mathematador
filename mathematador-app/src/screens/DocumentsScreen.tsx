import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";

import imageBG from "@/assets/images/screen-bg-public.png";
import PolicyLinks from "@/components/auth/PolicyLinks";
import Layout from "@/components/common/Layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { styles } from "@/theme";
import { RootStackParamList } from "@/types/Navigation";

type DocumentsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Documents"
>;

// The main menu's "documents" icon (#82) leads here rather than directly to
// one /info/* page - PolicyLinks already bridges out to those real Expo
// Router pages via expo-router's own <Link>, which works fine from inside
// this inner GameStack screen despite the two trees being isolated (see
// mathematador-app/CLAUDE.md's NavigationIndependentTree note) since Link
// navigates at the root router, not this inner Stack.Navigator.
const DocumentsScreen = (): JSX.Element => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<DocumentsScreenNavigationProp>();

  return (
    <Layout>
      <ScreenHeader title="Documents" onBack={() => navigation.goBack()} />
      <CenteredDesk styles={{ container: styles.screenCardMd }}>
        <PolicyLinks />
      </CenteredDesk>
    </Layout>
  );
};

export default DocumentsScreen;
