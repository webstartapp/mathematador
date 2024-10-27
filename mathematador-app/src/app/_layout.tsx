import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store, persistor } from '../redux/store';

import { useColorScheme } from '@/src/hooks/useColorScheme';
import { PersistGate } from 'redux-persist/integration/react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  }

  return (
    <ThemeProvider value={theme}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack
          initialRouteName='index'
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{
            headerShown: false, 
          }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
