import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX, useEffect } from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import docsIcon from "@/assets/images/home-icon-docs.png";
import gameIcon from "@/assets/images/home-icon-game.png";
import profileIcon from "@/assets/images/home-icon-profile.png";
import settingsIcon from "@/assets/images/home-icon-settings.png";
import shopIcon from "@/assets/images/home-icon-shop.png";
import imageBG from "@/assets/images/screen-bg-home.png";
import Layout from "@/components/common/Layout";
import { useMenuMusic } from "@/hooks/useMenuMusic";
import { useSyncUserSettings } from "@/hooks/useSyncUserSettings";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { RootState } from "@/redux/store";
import { styles } from "@/theme";
import { RootStackParamList } from "@/types/Navigation";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface MenuIcon {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

// Icon-driven main menu (issue #82) - replaces the previous CenteredDesk
// wood card + button list, which looked identical to every other "game
// menu" screen and fully blocked the new background art. No GameHeader
// here either (see GameStack.tsx) - the XP/level bar belongs to the
// header-equipped screens reached from this menu, not the menu itself.
// Coliseo (Gauntlet & Daily) moved to OperationSelectionScreen - the first
// header-equipped screen reached via the "game" icon below - rather than
// getting its own icon here.
const HomeScreen = (): JSX.Element => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user);
  const { start: startMenuMusic, stop: stopMenuMusic } = useMenuMusic();
  // Home is the natural post-login landing screen (no central "load
  // everything on app start" component exists in this codebase - each
  // screen self-fetches what it needs, e.g. TiendaScreen/GauntletScreen),
  // so this is where settings get synced from the server once per session.
  useSyncUserSettings();

  useEffect(() => {
    startMenuMusic();
    return () => stopMenuMusic();
  }, [startMenuMusic, stopMenuMusic]);

  const menuIcons: MenuIcon[] = [
    {
      key: "game",
      label: "Play",
      icon: gameIcon,
      onPress: () => navigation.navigate("SelectOperation"),
    },
    {
      key: "shop",
      label: "Tienda",
      icon: shopIcon,
      onPress: () => navigation.navigate("Tienda"),
    },
    {
      key: "profile",
      label: "Profile",
      icon: profileIcon,
      onPress: () => navigation.navigate("Profile"),
    },
    {
      key: "docs",
      label: "Documents",
      icon: docsIcon,
      onPress: () => navigation.navigate("Documents"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: settingsIcon,
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  return (
    <Layout>
      <Text style={styles.homeGreeting}>{`Welcome, ${user.name}`}</Text>
      <View style={styles.homeIconGrid}>
        {menuIcons.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.homeIconButton}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.homeIconImageWrapper}>
              <Image
                source={item.icon}
                style={styles.homeIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.homeIconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Layout>
  );
};

export default HomeScreen;
