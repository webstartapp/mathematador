import { useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import { RouteProp } from '@react-navigation/native';
import React, { FC } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { RootStackParamList } from '../types/Navigation';
import { ChalengeResult } from '../types/Chalenge';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChallengeResult'>;

type LevelScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeResult'>;

type ChallengeResultScreenProps = {
  route: LevelScreenRouteProp;

}

const ChallengeResultScreen: FC<ChallengeResultScreenProps> = ({ route }) => {
  const { challengeId, operationId, successful, results, time, correctAnswers, coins, xp } = route.params;
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();

  const handleReturn = () => {
    navigation.navigate('SelectLevel', { operationId });
  };

  return (
    <View style={styles.container}>
      {/* Challenge Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Challenge Results</Text>
        <Text style={styles.summaryText}>Challenge ID: {challengeId}</Text>
        <Text style={styles.summaryText}>Operation: {operationId}</Text>
        <Text style={styles.summaryText}>Time Taken: {time} seconds</Text>
        <Text style={styles.summaryText}>Correct Answers: {correctAnswers}/{results.length}</Text>
        <Text style={styles.summaryText}>Coins Earned: {coins}</Text>
        <Text style={styles.summaryText}>XP Earned: {xp}</Text>
        <Text style={styles.statusText}>{successful ? "Success!" : "Try Again!"}</Text>
      </View>

      {/* Detailed Exercise Results */}
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.challengeId}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Exercise</Text>
            <Text style={styles.exerciseText}>Expected Result: {item.expectedResult}</Text>
            <Text style={styles.exerciseText}>Your Result: {item.userResult}</Text>
            <Text style={styles.exerciseText}>Exercise Numbers: {item.exercise.join(", ")}</Text>
            <Text style={[styles.resultStatus, item.expectedResult == item.userResult ? styles.correct : styles.incorrect]}>
              {item.expectedResult == item.userResult ? "Correct" : "Incorrect"}
            </Text>
          </View>
        )}
      />

      {/* Return Button */}
      <View style={styles.buttonContainer}>
        <Button title="Back to Operations" onPress={handleReturn} />
      </View>
    </View>
  );
};

export default ChallengeResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  summaryContainer: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#008080',
  },
  exerciseContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseText: {
    fontSize: 16,
  },
  resultStatus: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  correct: {
    color: 'green',
  },
  incorrect: {
    color: 'red',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
