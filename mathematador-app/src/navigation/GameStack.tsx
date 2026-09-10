import {
  createStackNavigator,
  StackHeaderProps,
} from "expo-router/build/react-navigation/stack";
import { JSX } from "react";

import GameHeader from "@/components/common/Header";
import { resolveGatedInitialRoute } from "@/navigation/introSession";
import ChalengeSelectScreen from "@/screens/ChalengeSelectScreen";
import ChallengeScreen from "@/screens/ChallengeGameScreen";
import ChallengeResultScreen from "@/screens/ChallengeResultScreen";
import ConsentScreen from "@/screens/ConsentScreen";
import GauntletScreen from "@/screens/GauntletScreen";
import HomeScreen from "@/screens/HomeScreen";
import IntroScreen from "@/screens/IntroScreen";
import OperationSelectionScreen from "@/screens/OperationSelectionScreen";
import TiendaScreen from "@/screens/TiendaScreen";
import { RootStackParamList } from "@/types/Navigation";

const Stack = createStackNavigator<RootStackParamList>();

// Rendered only while the player is authenticated (see app/index.tsx) - the
// game itself and everything reachable from Home. Also routes through
// Consent (#31), same as AuthStack - an authenticated session can still
// have no local consent record (e.g. an account that logged in before this
// gate existed, or a fresh device/browser that never went through it), so
// reaching Home isn't safe to assume implies consent was ever given. Jumps
// straight to Home only once BOTH Intro and Consent are already resolved
// this session (e.g. just shown by AuthStack right before sign-in) - see
// introSession.ts's resolveGatedInitialRoute for why Intro alone having
// played isn't enough.
const GameStack = (): JSX.Element => (
  <Stack.Navigator
    initialRouteName={resolveGatedInitialRoute("Home")}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Intro"
      component={IntroScreen}
      initialParams={{ nextRoute: "Consent" }}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Consent"
      component={ConsentScreen}
      initialParams={{ nextRoute: "Home" }}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        headerShown: true,
        header: (props: StackHeaderProps) => <GameHeader props={props} />,
      }}
    />
    <Stack.Screen
      name="SelectOperation"
      component={OperationSelectionScreen}
      options={{
        headerShown: true,
        header: (props: StackHeaderProps) => (
          <GameHeader backTo="Home" props={props} />
        ),
      }}
    />
    <Stack.Screen
      name="ChalengeSelect"
      component={ChalengeSelectScreen}
      options={{
        headerShown: true,
        header: (props: StackHeaderProps) => (
          <GameHeader backTo="Home" showOperation props={props} />
        ),
      }}
    />
    <Stack.Screen
      name="ChallengeResult"
      component={ChallengeResultScreen}
      options={{
        headerShown: true,
        header: (props: StackHeaderProps) => (
          <GameHeader backTo="Home" showOperation props={props} />
        ),
      }}
    />
    <Stack.Screen
      name="Challenge"
      component={ChallengeScreen}
      options={{
        headerShown: true,
        header: (props: StackHeaderProps) => (
          <GameHeader backTo="Home" showOperation props={props} />
        ),
      }}
    />
    <Stack.Screen
      name="Tienda"
      component={TiendaScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Gauntlet"
      component={GauntletScreen}
      options={{
        headerShown: false,
      }}
    />
    {/* Add other screens here */}
  </Stack.Navigator>
);

export default GameStack;
