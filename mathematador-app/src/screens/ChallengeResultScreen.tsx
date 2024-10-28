import { useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import { RouteProp } from '@react-navigation/native';
import React, { FC } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { RootStackParamList } from '../types/Navigation';
import { ChalengeResult } from '../types/Chalenge';
import ParallaxScrollView from '../components/ParallaxScrollView';
import Layout from '../components/common/Layout';
import CenteredDesk from '../components/layouts/CenteredDesk';
import Button from '../components/common/Button';
import { operations } from '../configs/operations';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChallengeResult'>;

type LevelScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeResult'>;

type ChallengeResultScreenProps = {
  route: LevelScreenRouteProp;

}

const ChallengeResultScreen: FC<ChallengeResultScreenProps> = ({ route }) => {
  const { challengeId, operationId, successful, results, time, correctAnswers, coins, xp } = route.params;
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();

  const operation = operations.find(operationItem => operationItem.operationId === operationId);

  const handleReturn = () => {
    navigation.navigate('ChalengeSelect', { operationId });
  };

  return (
    <Layout>
      <View style={styles.container}>
        <CenteredDesk
          styles={{
            wrapper: {
              marginBottom: 40,
            }
          }}
          title={'Challenge Results'}
          subtitles={[
            `Challenge ID: ${challengeId}`,
            successful ? "Success!" : "Try Again!"
          ]}
          descriptions={[
            `Operation: ${operationId}`,
            `Time Taken: ${time} seconds`,
            `Correct Answers: ${correctAnswers}/${results.length}`,
            `Coins Earned: ${coins}`,
            `XP Earned: ${xp}`,
          ]}
        >
          <Button title="Continue" onPress={handleReturn} />
        </CenteredDesk>
        <CenteredDesk
          styles={{
            wrapper: {
              marginBottom: 20,
            }
          }}
          title={'Exercise results'} 
        />
        {results.map((result, index) => (
          <CenteredDesk
              styles={{
                wrapper: {
                  marginBottom: 20,
                }
              }}
              title={`Exercise ${index + 1}`}
              subtitles={[
                `Expected Result: ${result.expectedResult}`,
                `Your Result: ${result.userResult}`,
                `${result.exercise.join(' ' + operation?.symbol + ' ')}=${String(result.expectedResult).split('').map(i=>'?').join('')}`,
                `Status: ${result.expectedResult == result.userResult ? "Correct" : "Incorrect"}`,
              ]}
              key={`Exercise_index_${index}_${result.expectedResult}`}
          />   
        ))}
        </View>
        </Layout>
  );
};

export default ChallengeResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
