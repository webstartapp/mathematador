// screens/OperationSelectionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Challenge'>;

interface Operation {
  id: string;
  label: string;
}

const operations: Operation[] = [
  { id: 'addition', label: 'Addition' },
  { id: 'subtraction', label: 'Subtraction' },
  { id: 'multiplication', label: 'Multiplication' },
  { id: 'division', label: 'Division' },
];

const OperationSelectionScreen: React.FC = () => {
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();

  const handleOperationPress = (operationId: string) => {
    navigation.navigate('SelectLevel', { operationId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select an Operation</Text>
      <View style={styles.grid}>
        {operations.map((operation) => (
          <TouchableOpacity
            key={operation.id}
            style={styles.operationButton}
            onPress={() => handleOperationPress(operation.id)}
          >
            <Text style={styles.operationLabel}>{operation.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
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
  },
  operationButton: {
    width: '48%',
    aspectRatio: 2 / 1,
    backgroundColor: '#ffddc1', // Soft background color for visual appeal
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
});

export default OperationSelectionScreen;
