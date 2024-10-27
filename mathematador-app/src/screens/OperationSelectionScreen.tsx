// screens/OperationSelectionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { operations } from '../configs/operations';
import CenteredDesk from '../components/layouts/CenteredDesk';
import Layout from '../components/common/Layout';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Challenge'>;

interface Operation {
  id: string;
  label: string;
}

const OperationSelectionScreen: React.FC = () => {
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();
  const operationProgress = useSelector((state: RootState) => state.user.operationProgress);

  const mixedOperations = operations.map((operation) => {
    const progress = operationProgress.find((progress) => progress.operationId === operation.operationId);
    return {
      ...operation,
      progress,
    };
  });

  const handleOperationPress = (operationId: string) => {
    navigation.navigate('ChalengeSelect', { operationId });
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.header}>Select an Operation</Text>
        <View style={styles.grid}>
          {mixedOperations.map((operation) => (
            <TouchableOpacity
              key={operation.operationId}
              style={styles.operationButton}
              onPress={() => handleOperationPress(operation.operationId)}
            >
              <CenteredDesk
                title={operation.symbol}
                subtitles={[
                  operation.label,
                  `Challenge: ${operation?.progress?.currentChallengeId || '1'}`,
                ]}
                descriptions={[
                  `Level: ${operation?.progress?.level || 1}`,
                ]}
              />
            </TouchableOpacity>
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flexBasis: '50%',
  },
  operationButton: {
    width: '48%',
    aspectRatio: 2 / 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  operationLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  operationSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  operationDescription: {
    fontSize: 14,
    color: '#333',
  },
});

export default OperationSelectionScreen;
