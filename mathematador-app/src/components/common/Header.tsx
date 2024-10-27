// components/common/GameHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ProgressBar } from 'react-native-paper'; // Example of a simple progress bar component
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from "../../types/Navigation";
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;


type HeaderProps = {
  backTo?: keyof RootStackParamList;
  showOperation?: boolean;
};

const GameHeader: React.FC<HeaderProps> = ({
  backTo
}) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const { backToParams } = useSelector((state: RootState) => state.navigation);
  
  // Accessing user stats from Redux
  const { level, xp, xpToNextLevel } = useSelector((state: RootState) => state.user);

  // Calculate XP progress percentage
  const xpProgress = xp / xpToNextLevel;

  return (
    <View style={styles.headerContainer}>
        {backTo && (
      <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate(backTo, backToParams as any)}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
      </View>
        )}
      <View style={styles.statsContainer}>
        <Text style={styles.level}>Level {level}</Text>
        <ProgressBar progress={xpProgress} color="#ffd700" style={styles.progressBar} />
        <Text style={styles.xpText}>{xp}/{xpToNextLevel} XP</Text>
      </View>
      
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
          <Icon name="bar-chart" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon name="user" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  level: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 5,
  },
  xpText: {
    fontSize: 12,
    color: '#666',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
});

export default GameHeader;
