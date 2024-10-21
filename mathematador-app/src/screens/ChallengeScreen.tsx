import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import MathChallenge from '../components/game/MathChallenge';
import { useDispatch, useSelector } from 'react-redux';
import { addXP, levelUp } from '../redux/slices/userSlice';
import { generateQuestion, checkAnswer, nextChallenge } from '../redux/slices/gameSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { RootState } from '../redux/store'; // Assuming this is where your root state is defined

type ChallengeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Challenge'>;
type ChallengeScreenRouteProp = RouteProp<RootStackParamList, 'Challenge'>;

interface Props {
  route: ChallengeScreenRouteProp;
}

const ChallengeScreen: React.FC<Props> = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<ChallengeScreenNavigationProp>();
  const { challengeId } = route.params;

  // Select the current challenge from the Redux store
  const currentChallenge = useSelector((state: RootState) => state.game.currentChallenge);

  // Generate the challenge when the screen is loaded
  useEffect(() => {
    dispatch(generateQuestion(challengeId)); // Dispatch generateQuestion to create a new challenge
  }, [dispatch, challengeId]);

  const handleSubmit = (answer: string) => {
    dispatch(checkAnswer({ challengeId, answer })); // Dispatch checkAnswer with the answer
    const isCorrect = currentChallenge && currentChallenge.answer === answer; // Check if the answer is correct

    if (isCorrect) {
      dispatch(addXP(20));
      Alert.alert('Correct!', 'You earned 20 XP.', [
        { text: 'Next Challenge', onPress: () => dispatch(nextChallenge()) },
      ]);
    } else {
      Alert.alert('Incorrect', 'Try again!', [{ text: 'OK' }]);
    }
  };

  return (
    <Layout>
      <Header title="Challenge" />
      <View style={styles.content}>
        {currentChallenge ? (
          <MathChallenge question={currentChallenge.question} onSubmit={handleSubmit} />
        ) : (
          <Text>Loading...</Text>
        )}
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
