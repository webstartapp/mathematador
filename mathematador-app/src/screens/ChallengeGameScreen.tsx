import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Layout from '../components/common/Layout';
import { RouteProp, useRoute } from '@react-navigation/native';

import { RootStackParamList } from '../types/Navigation';
import { ChalengeResult, Challenge } from '../types/Chalenge';
import { completeChalange } from '../redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { minigames } from '../configs/minigames';


type ChallengeScreenRouteProp = RouteProp<RootStackParamList, 'Challenge'>;
type ChallengeScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Challenge'>;

const ChallengeScreen: React.FC = () => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigator = useNavigation<ChallengeScreenNavigationProps>();
  const challenge = route.params;
  const dispatch = useDispatch();

  // Get the appropriate minigame based on challengeId
  const minigame = minigames.find((minigame) => minigame.id === challenge.minigame);
  const MinigameComponent = minigame?.component;

  return (
    <Layout>
      <View style={styles.content} id="im content">
        {MinigameComponent ? <MinigameComponent challenge={challenge} submitResults={(result)=>{
          console.log(37, result);
          dispatch(completeChalange(result));
          navigator.navigate('ChallengeResult', result);
        }} /> : null}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    
  },
});

export default ChallengeScreen;
