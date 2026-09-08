import { NavigationIndependentTree } from "expo-router/build/react-navigation/core";
import { NavigationContainer } from "expo-router/build/react-navigation/native";
import { JSX } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";

import AuthStack from "@/navigation/AuthStack";
import GameStack from "@/navigation/GameStack";
import AnimatedBackgroundProvider from "@/providers/animations/AnimatedImage";
import MenuMusicProvider from "@/providers/audio/MenuMusicProvider";
import { selectIsAuthenticated } from "@/redux/selectors/auth";

const IndexPage = (): JSX.Element => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <MenuMusicProvider>
      <AnimatedBackgroundProvider>
        <View
          style={{ flex: 1, backgroundColor: "transparent", width: "100%" }}
          id="_main_layout_holder"
        >
          {/* Isolated from Expo Router's own NavigationContainer/linking so that
          gameplay navigation (Home, SelectOperation, Challenge, ...) never
          leaks screen names into the browser URL - the app must stay a SPA
          at "/" during play (issue #33). Without this, React Navigation's
          default path serialization writes every nested screen name into
          the URL since this stack has no linking config of its own. */}
          <NavigationIndependentTree>
            <NavigationContainer>
              {isAuthenticated ? <GameStack /> : <AuthStack />}
            </NavigationContainer>
          </NavigationIndependentTree>
        </View>
      </AnimatedBackgroundProvider>
    </MenuMusicProvider>
  );
};

export default IndexPage;
