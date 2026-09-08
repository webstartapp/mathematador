import { createStackNavigator } from "expo-router/build/react-navigation/stack";
import { JSX } from "react";

import IntroScreen from "@/screens/IntroScreen";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { RootStackParamList } from "@/types/Navigation";

const Stack = createStackNavigator<RootStackParamList>();

// Rendered only while the player is NOT authenticated (see app/index.tsx).
// Intro is reused from GameStack so a first-time visitor still sees it
// before being asked to log in - #31 (consent gate) will later insert a
// Consent screen here between Intro and Login by adding one screen and
// changing Intro's initialParams.nextRoute below.
const AuthStack = (): JSX.Element => (
  <Stack.Navigator
    initialRouteName="Intro"
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Intro"
      component={IntroScreen}
      initialParams={{ nextRoute: "Login" }}
    />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export default AuthStack;
