import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addXP } from '../redux/slices/userSlice';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const handleStartGame = () => {
    navigation.navigate('Level', { levelId: 1 });
  };

  const handleAddXP = () => {
    dispatch(addXP(10));
  };

  return (
    <Layout>
      <Header title="Mathemátador" />
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user.name}!</Text>
        <Text style={styles.level}>Level: {user.level}</Text>
        <Text style={styles.xp}>XP: {user.xp}</Text>
        <Button title="Start Game" onPress={handleStartGame} />
        <Button title="Add XP" onPress={handleAddXP} />
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
