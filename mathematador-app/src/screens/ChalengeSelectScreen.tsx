import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';
import Layout from '../components/common/Layout';
import CenteredDesk from '../components/layouts/CenteredDesk';
import Button from '../components/common/Button';
import { operations } from '../configs/operations';
import ThemedText from '../components/texts/ThemedText';

type ChalengeSelectScreenRouteProp = RouteProp<RootStackParamList, 'ChalengeSelect'>;
type ChalengeSelectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChalengeSelect'>;

interface Props {
  route: ChalengeSelectScreenRouteProp;
}

const ChalengeSelect: React.FC<Props> = ({ route }) => {
  const { operationId } = route.params;
  const navigation = useNavigation<ChalengeSelectScreenNavigationProp>();

  // Retrieve challenges for the selected operation from Redux
  const operationStatistics = useSelector((state: RootState) => 
    state.user.operationProgress.find(operation => operation.operationId === operationId)
  );
  const operation = operations.find(operationItem => operationItem.operationId === operationId);
  const currentChallenge = operationStatistics?.currentChallengeId || 1;
  const completedChallenges = useSelector((state: RootState) => {
    return state.game.challenges.map(challenge => ({
      ...challenge,
      completed: state.user?.completedChalenges?.find(challengeCompleted => challenge.challengeId === challengeCompleted?.challengeId),
    }))
    .filter((challenge: any) => challenge.completed).map(challenge=> challenge.completed) as typeof state.user.completedChalenges;
  });

  const wholestate = useSelector((state: RootState) => state);

  console.log(operationStatistics, wholestate);

  // Start button handler
  const handleStartChallenge = (chalengeId: number) => {
    if (chalengeId) {
      // dispatch(startChallenge({ challengeId }));
      navigation.navigate('Challenge', { challengeId: chalengeId, operationId: operationId });
    }
  };

  return (
    
    <Layout>
      <View style={styles.container}>
        <CenteredDesk
          title={`Operation: ${operationId}`}
          subtitles={[
            `Current Challenge: ${currentChallenge}`,
          ]}
          descriptions={[
            operation?.description || '',
          ]}
        >
          <Button title='Start' onPress={()=>handleStartChallenge(currentChallenge)} />
        </CenteredDesk>
        <View style={styles.currentChallengeContainer}>
          <CenteredDesk title='Completed Challenges' />
        </View>
        <View style={styles.challengeBoxContainer}>
          {completedChallenges?.map((challenge) => (
            <View style={styles.challengeBox} key={challenge.challengeId} id="challengeBox">
              <CenteredDesk
                title={`Challenge ${challenge.challengeId}`}
                styles={{
                  container: {
                    marginBottom: 10,
                  }
                }}
                subtitles={[
                  `Answers: ${challenge.correctAnswers}/${challenge.results.length}`,
                  `Time: ${challenge.time} seconds`,
                ]}
              >
                <Button title='Repeat' onPress={()=>handleStartChallenge(challenge.challengeId)} />
              </CenteredDesk>
            </View>
          ))}
            </View>
      </View>
    </Layout>
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
    marginBottom: 25,
    marginTop: 25,
  },
  challengeBoxContainer: {
    margin: 10,
    flexDirection: 'row',
  },
  challengeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  challengeBox: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexGrow: 1,
    maxWidth: '100%',
  },
});

export default ChalengeSelect;
