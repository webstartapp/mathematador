import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addXP, levelUp } from '../redux/slices/userSlice';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const handleStartGame = () => {
    navigation.navigate('SelectOperation');
  };

  const handleAddXP = () => {
    dispatch(addXP(10));
  };

  const handleLevelUp = () => {
    dispatch(levelUp());
  }

  return (
    <Layout>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user.name}!</Text>
        <Text style={styles.level}>Level: {user.level}</Text>
        <Text style={styles.xp}>XP: {user.xp}</Text>
        <Button title="Start Game" onPress={handleStartGame} />
        <Button title="Add XP" onPress={handleAddXP} />
        { user.xp >= user.xpToNextLevel && <Button title="Level Up" onPress={handleLevelUp} /> }
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
  welcome: {
    fontSize: 24,
    marginBottom: 10,
  },
  level: {
    fontSize: 18,
    marginBottom: 5,
  },
  xp: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default HomeScreen;
