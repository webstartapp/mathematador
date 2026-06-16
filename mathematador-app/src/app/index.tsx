import {
  createStackNavigator,
  StackHeaderProps,
} from "expo-router/build/react-navigation/stack";
import { JSX } from "react";
import { View } from "react-native";

import GameHeader from "@/components/common/Header";
import AnimatedBackgroundProvider from "@/providers/animations/AnimatedImage";
import ChalengeSelectScreen from "@/screens/ChalengeSelectScreen";
import ChallengeScreen from "@/screens/ChallengeGameScreen";
import ChallengeResultScreen from "@/screens/ChallengeResultScreen";
import GauntletScreen from "@/screens/GauntletScreen";
import HomeScreen from "@/screens/HomeScreen";
import OperationSelectionScreen from "@/screens/OperationSelectionScreen";
import TiendaScreen from "@/screens/TiendaScreen";
import { RootStackParamList } from "@/types/Navigation";
// Import other screens as needed

const Stack = createStackNavigator<RootStackParamList>();

const IndexPage = (): JSX.Element => (
  <AnimatedBackgroundProvider>
    <View
      style={{ flex: 1, backgroundColor: "transparent", width: "100%" }}
      id="_main_layout_holder"
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
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
    </View>
  </AnimatedBackgroundProvider>
);

export default IndexPage;
