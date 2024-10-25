import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from '../screens/HomeScreen';
import LevelScreen from '../screens/LevelScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import GameHeader from "../components/common/Header";
import { RootStackParamList } from "../types/Navigation";
import OperationSelectionScreen from "../screens/OperationSelectionScreen";
import SelectLevelScreen from "../screens/SelectLevelScreen";
// Import other screens as needed


const Stack = createStackNavigator<RootStackParamList>();

export default () => (
    <Stack.Navigator initialRouteName="Home" screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="Home" component={HomeScreen} 
        options={{
            headerShown: true,
            header: ()=><GameHeader />
        }}
      />
      <Stack.Screen name="SelectOperation" component={OperationSelectionScreen} 
        options={{
            headerShown: true,
            header: ()=><GameHeader backTo="Home"/>
        }}
      />
      <Stack.Screen name="SelectLevel" component={SelectLevelScreen}
        options={{
            headerShown: true,
            header: ()=><GameHeader backTo="Home"/>
        }}
    />
      <Stack.Screen name="Level" component={LevelScreen} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      {/* Add other screens here */}
    </Stack.Navigator>
);