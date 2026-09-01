import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import {
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { JSX } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import spaceMonoFont from "@/assets/fonts/SpaceMono-Regular.ttf";
import { silenceThirdPartyWarnings } from "@/helpers/silenceThirdPartyWarnings";
import { store, persistor } from "@/redux/store";

const queryClient = new QueryClient();

silenceThirdPartyWarnings();

// Prevent the splash screen from auto-hiding before asset loading is
// complete. Deliberately NOT hidden here once fonts load - IntroScreen holds
// it up further and hides it itself once the intro video is ready to play,
// so the native splash image acts as a seamless "poster" for the video
// (expo-splash-screen has no native video/animation support, only a static
// image compiled from app.json, so this is the closest thing to it).
SplashScreen.preventAutoHideAsync();

const RootLayout = (): JSX.Element | null => {
  const [loaded] = useFonts({
    SpaceMono: spaceMonoFont,
  });

  if (!loaded) {
    return null;
  }

  const theme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  };

  return (
    <ThemeProvider value={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <Stack
              initialRouteName="index"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
};

export default RootLayout;
