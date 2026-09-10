import { createStackNavigator } from "expo-router/build/react-navigation/stack";
import { JSX } from "react";

import { resolveGatedInitialRoute } from "@/navigation/introSession";
import AuthScreen from "@/screens/AuthScreen";
import ConsentScreen from "@/screens/ConsentScreen";
import IntroScreen from "@/screens/IntroScreen";
import { RootStackParamList } from "@/types/Navigation";

const Stack = createStackNavigator<RootStackParamList>();

// Rendered only while the player is NOT authenticated (see app/index.tsx).
// Intro is reused from GameStack so a first-time visitor still sees it
// before being asked to log in. Consent (#31) sits between Intro and Auth -
// it decides for itself whether to actually show the gate or skip straight
// to Auth (see ConsentScreen's own local-storage check), so no branching is
// needed here. Jumps straight to Auth only once BOTH Intro and Consent are
// already resolved this session (e.g. logging out and back in without
// reloading the page) - see introSession.ts's resolveGatedInitialRoute for
// why Intro alone having played isn't enough.
const AuthStack = (): JSX.Element => (
  <Stack.Navigator
    initialRouteName={resolveGatedInitialRoute("Auth")}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Intro"
      component={IntroScreen}
      initialParams={{ nextRoute: "Consent" }}
    />
    <Stack.Screen
      name="Consent"
      component={ConsentScreen}
      initialParams={{ nextRoute: "Auth" }}
    />
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

export default AuthStack;
