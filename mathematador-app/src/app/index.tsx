import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from '../screens/HomeScreen';
import ChallengeScreen from '../screens/ChallengeGameScreen';
import GameHeader from "../components/common/Header";
import { RootStackParamList } from "../types/Navigation";
import OperationSelectionScreen from "../screens/OperationSelectionScreen";
import ChalengeSelectScreen from "../screens/ChalengeSelectScreen";
import ChallengeResultScreen from "../screens/ChallengeResultScreen";
import { View } from "react-native";
import AnimatedBackgroundProvider from "../providers/animations/AnimatedImage";
// Import other screens as needed


const Stack = createStackNavigator<RootStackParamList>();

const IndexPage = () => (
  <AnimatedBackgroundProvider>  
    <View style={{ flex: 1, backgroundColor: 'transparent', width: '100%' }} id="_main_layout_holder">
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
            header: () => <GameHeader />,
          }}
        />
        <Stack.Screen
          name="SelectOperation"
          component={OperationSelectionScreen}
          options={{
            headerShown: true,
            header: () => <GameHeader backTo="Home" />,
          }}
        />
        <Stack.Screen
          name="ChalengeSelect"
          component={ChalengeSelectScreen}
          options={{
            headerShown: true,
            header: () => <GameHeader backTo="Home" showOperation />,
          }}
        />
        <Stack.Screen
          name="ChallengeResult"
          component={ChallengeResultScreen}
          options={{
            headerShown: true,
            header: () => <GameHeader backTo="Home" showOperation />,
          }}
        />
        <Stack.Screen
          name="Challenge"
          component={ChallengeScreen}
          options={{
            headerShown: true,
            header: () => <GameHeader backTo="Home" showOperation />,
          }}
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    </View>
  </AnimatedBackgroundProvider>
);

export default IndexPage;