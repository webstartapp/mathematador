// screens/OperationSelectionScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Operation, operations } from '../configs/operations';
import CenteredDesk from '../components/layouts/CenteredDesk';
import Layout from '../components/common/Layout';
import { useDispatch } from 'react-redux';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Challenge'>;

const OperationprogressItem = ({
  operation,
  handleOperationPress,
}: {
  operation: Operation;
  handleOperationPress: (operationId: string) => void;
}) => {
  const operationProgress = useSelector(
    (state: RootState) => state.user.operationProgress.find((progress) => progress.operationId === operation.operationId));
  
  return (
    <TouchableOpacity
      key={operation.operationId}
      style={styles.operationButton}
      onPress={() => handleOperationPress(operation.operationId)}
    >
      <CenteredDesk
        title={operation.symbol}
        subtitles={[
          operation.label,
          `Challenge: ${operationProgress?.currentChallengeId || '1'}`,
        ]}
        descriptions={[
          `Level: ${operationProgress?.level || 1}`,
        ]}
        styles={{
          wrapper: {
            width: '100%',
            minWidth: 200,
            padding: 10,
          },
          container: {
          },
        }}
      />
    </TouchableOpacity>
  );
};

const OperationSelectionScreen: React.FC = () => {
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();
  const dispatch = useDispatch();
  console.log(31);

  const handleOperationPress = (operationId: string) => {
    navigation.navigate('ChalengeSelect', { operationId });
  };

  return (
    <Layout>
      <View style={styles.container}>
        
        <CenteredDesk
          title="Select Chalenge"
          styles={{
            wrapper: {
              padding: 20,
            },
          }}
        />
        <View style={styles.grid} id="im-grid">
          {operations.map((operation) => (
            <OperationprogressItem
              key={operation.operationId}
              operation={operation}
              handleOperationPress={handleOperationPress}
            />
          ))}
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
    flexDirection: 'row',
  },
  operationButton: {
    width: '100%',
    maxWidth: 400,
    minWidth: 200,
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
