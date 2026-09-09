import { createStackNavigator } from "expo-router/build/react-navigation/stack";
import { JSX } from "react";

import { hasIntroAlreadyPlayed } from "@/navigation/introSession";
import AuthScreen from "@/screens/AuthScreen";
import IntroScreen from "@/screens/IntroScreen";
import { RootStackParamList } from "@/types/Navigation";

const Stack = createStackNavigator<RootStackParamList>();

// Rendered only while the player is NOT authenticated (see app/index.tsx).
// Intro is reused from GameStack so a first-time visitor still sees it
// before being asked to log in - #31 (consent gate) will later insert a
// Consent screen here between Intro and Auth by adding one screen and
// changing Intro's initialParams.nextRoute below. Skips straight to Auth
// when Intro already played this session (e.g. logging out and back in
// without reloading the page) so it never plays twice in a row.
const AuthStack = (): JSX.Element => (
  <Stack.Navigator
    initialRouteName={hasIntroAlreadyPlayed() ? "Auth" : "Intro"}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Intro"
      component={IntroScreen}
      initialParams={{ nextRoute: "Auth" }}
    />
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

export default AuthStack;
