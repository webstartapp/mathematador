import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
// import { startChallenge } from '../redux/slices/gameSlice';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';

type SelectLevelScreenRouteProp = RouteProp<RootStackParamList, 'SelectLevel'>;
type SelectLevelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SelectLevel'>;

interface Props {
  route: SelectLevelScreenRouteProp;
}

const SelectLevel: React.FC<Props> = ({ route }) => {
  const { operationId } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation<SelectLevelScreenNavigationProp>();

  

  // Retrieve challenges for the selected operation from Redux
  const challenges = useSelector((state: RootState) => 
    state.game.challenges.filter(challenge => challenge.operationId === operationId)
  );
  const currentChallenge = challenges.find(challenge => !challenge.completed);
  const completedChallenges = challenges
    .filter(challenge => challenge.completed)
    .sort((a, b) => b.dateCompleted - a.dateCompleted); // Sort by latest

  // Start button handler
  const handleStartChallenge = () => {
    if (currentChallenge) {
      // dispatch(startChallenge({ challengeId: currentChallenge.id }));
      navigation.navigate('Challenge', { challengeId: currentChallenge.id });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Operation: {operationId}</Text>

      {currentChallenge && (
        <View style={styles.currentChallengeContainer}>
          <Text style={styles.challengeText}>Challenge {currentChallenge.level}</Text>
          <Button title="Start" onPress={handleStartChallenge} />
        </View>
      )}

      <Text style={styles.subTitle}>Completed Challenges</Text>
      <FlatList
        data={completedChallenges}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeText}>Challenge {item.level}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  currentChallengeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  challengeBox: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SelectLevel;
