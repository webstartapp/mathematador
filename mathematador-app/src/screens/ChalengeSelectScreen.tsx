import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';
import Layout from '../components/common/Layout';
import CenteredDesk from '../components/layouts/CenteredDesk';
import Button from '../components/common/Button';
import { operations } from '../configs/operations';
import { Challenge } from '../types/Chalenge';

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
  const currentChallenge = operationStatistics?.currentChallenge;
  const completedChallenges = operationStatistics?.completedChallenges;

  console.log(34, operationStatistics);

  // Start button handler
  const handleStartChallenge = (challenge?: Challenge) => {
    if (challenge) {
      navigation.navigate('Challenge', challenge);
    }
  };

  return (
    
    <Layout>
      <View style={styles.container}>
        <CenteredDesk
          title={`Operation: ${operationId}`}
          subtitles={[
            `Challenge: ${currentChallenge?.challengeOrderId || 1}`,
            `Level: ${currentChallenge?.level || 1}`,
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
            <View style={styles.challengeBox} key={challenge.challengeOrderId} id="challengeBox">
              <CenteredDesk
                title={`Challenge ${challenge.challengeOrderId}`}
                styles={{
                  container: {
                    marginBottom: 10,
                    width: '100%',
                  }
                }}
                subtitles={[
                  `Level: ${challenge.level}`,
                  `Answers: ${challenge.correctAnswers}/${challenge.results.length}`,
                  `Time: ${challenge.time} seconds`,
                ]}
              >
                <Button title='Repeat' onPress={()=>handleStartChallenge(challenge)} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    flexBasis: '100%',
    flexGrow: 1,
  },
  challengeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  challengeBox: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 8,
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChalengeSelect;
