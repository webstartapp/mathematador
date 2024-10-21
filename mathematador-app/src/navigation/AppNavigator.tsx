import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import LevelScreen from '../screens/LevelScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
// Import other screens as needed

export type RootStackParamList = {
  Home: undefined;
  Level: { levelId: number };
  Challenge: { challengeId: number };
  // Define other routes here
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Level" component={LevelScreen} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
