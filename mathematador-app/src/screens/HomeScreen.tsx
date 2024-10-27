import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import { StackNavigationProp } from '@react-navigation/stack';
import imageBG from '../../assets/images/intro-screen.png';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';
import { useAnimatedBackground } from '../providers/animations/AnimatedImage';
import CenteredDesk from '../components/layouts/CenteredDesk';
import ThemedText from '../components/texts/ThemedText';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user);

  const handleStartGame = () => {
    navigation.navigate('SelectOperation');
  };

  return (
    <Layout>
      <CenteredDesk
        title={`Welcome, ${user.name}`}
        subtitles={[
          `Level ${user.level}`,
          `XP: ${user.xp}`,
        ]}
      >
        <Button title="Start Game" onPress={handleStartGame} />
      </CenteredDesk>
    </Layout>
  );
};

export default HomeScreen;
