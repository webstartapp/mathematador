import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import { RouteProp, useRoute } from '@react-navigation/native';

// Import minigame components
import SingleLineMinigame from '../components/minigames/SingleLineMinigame';
import { RootStackParamList } from '../types/Navigation';
// import VerticalAdditionMinigame from '../components/minigames/VerticalAdditionMinigame';
// import PuzzleMinigame from '../components/minigames/PuzzleMinigame';
// import MultipleChoiceMinigame from '../components/minigames/MultipleChoiceMinigame';

// Define a type for the route
type ChallengeScreenRouteProp = RouteProp<RootStackParamList, 'Challenge'>;

const minigames = [
  SingleLineMinigame,
  SingleLineMinigame,
  SingleLineMinigame,
  // VerticalAdditionMinigame,
  // PuzzleMinigame,
  // MultipleChoiceMinigame,
];

// Function to select a minigame based on challengeId
function getMinigameIndex(challengeId: number): number {
  return challengeId % minigames.length;
}

const ChallengeScreen: React.FC = () => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const { challengeId, operationId } = route.params;

  // Get the appropriate minigame based on challengeId
  const MinigameComponent = minigames[getMinigameIndex(challengeId)];

  return (
    <Layout>
      <Header />
      <View style={styles.content}>
        {/* Render the selected minigame */}
        <MinigameComponent challengeId={challengeId} operationId={operationId} />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChallengeScreen;
