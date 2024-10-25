import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';

type LevelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Level'>;
type LevelScreenRouteProp = RouteProp<RootStackParamList, 'Level'>;

interface Props {
  route: LevelScreenRouteProp;
}

const LevelScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<LevelScreenNavigationProp>();
  const { levelId } = route.params;

  const handleStartChallenge = () => {
    navigation.navigate('Challenge', { challengeId: levelId });
  };

  return (
    <Layout>
      <View style={styles.content}>
        <Text style={styles.description}>Welcome to Level {levelId}! Get ready to tackle some math challenges.</Text>
        <Button title="Start Challenge" onPress={handleStartChallenge} />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default LevelScreen;
