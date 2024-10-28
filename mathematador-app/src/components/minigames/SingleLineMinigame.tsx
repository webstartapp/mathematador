import React, { FC, LegacyRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, GestureResponderEvent, PanResponderGestureState, LayoutChangeEvent, PanResponder, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Operation, operations } from '../../configs/operations';
import { ChalengeResult, Challenge, ExerciseInputPosition, ExerciseResult } from '@/src/types/Chalenge';
import { useNavigation } from 'expo-router';
import MinigameKeyboard from './components/MinigameKeyboard';
import { computePositionKey } from './helpers/computePositionKey';
import ExerciseValueDropDigits from './components/ExerciseValueDropDigits';
import ExerciseValuePreview from './components/ExerciseValuePreview';
import { challengeByOperationAndMinigame, ChallengeCoeficients } from '@/src/configs/challengeExercises';
import { useDispatch } from 'react-redux';
import { completeChalange } from '@/src/redux/slices/userSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/src/types/Navigation';
import HalvingLayout from './components/HalvingLayout';

type OperationSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Challenge'>;

interface ExerciseProps {
  exercise: number[];
  exerciseId: number;
  exerciseResult: Record<string, number>;
  exercisePositions: ExerciseInputPosition[];
  complexity: number;
  operation: Operation;
  resultIsFirst: boolean;
  onAnswer: (answer: number) => void;
  updateExercisePositions: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
}

const Exercise: FC<ExerciseProps> = ({ exercise, operation, resultIsFirst, onAnswer, complexity, updateExercisePositions, exerciseResult, exerciseId, exercisePositions }) => {
  const exerciseIdRef = useRef(exerciseId);
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  const exercisesCuts = useMemo(() => {
    return exercise.slice(0, complexity); 
  }, [exercise, complexity]);

  const result = useMemo(() => operation.getResult(exercisesCuts), [exercisesCuts, operation]);

  const exerciseItems = useMemo(() => {
    const exerciseCut = exercise.slice(0, complexity);
    const exerciseList = [
      ...(resultIsFirst ? [result] : exerciseCut),
      ...(!resultIsFirst ? exerciseCut : [result]),
    ];
    return exerciseList.slice(0, exerciseList.length - 2);
  }, [exercise, complexity, resultIsFirst, result]);

  const resultItem = useMemo(() => {
    return resultIsFirst ? exerciseItems[exerciseItems.length - 1] : result;
  }, [exerciseItems, result, resultIsFirst]);
  
  useEffect(() => {
    const answer = Object.values(exerciseResult || {});
    if (answer.length === String(resultItem).length) {
      onAnswer(Number(answer.join('')));
    }
  }, [exerciseResult, resultItem, onAnswer]);

  return (
    <View style={styles.exerciseContainer}>
      {exerciseItems?.map((item, index) => (
        <View style={styles.exerciseValues}>
          <View key={index} style={styles.exerciseValue} >
            <ExerciseValuePreview value={String(item)}
              exerciseId={exerciseId}
            />
            {index < exerciseItems.length - 1 && <ExerciseValuePreview value={operation.symbol} exerciseId={exerciseId}/>}
          </View>
        </View>
      ))}
      <ExerciseValuePreview value={'='} exerciseId={exerciseId} /> 
      <ExerciseValueDropDigits
        value={resultItem}
        updateExercisePositions={(exercisePositions) => updateExercisePositions(exercisePositions.map(item=>({...item, exerciseIndex: exerciseIdRef.current})), exerciseIdRef.current)}
        result={exerciseResult}
        exerciseId={exerciseId}
        exercisePositions={exercisePositions}
      />
    </View>
  );
};

interface SingleLineProps {
  challengeId: number;
  operationId: string;
}

const getChalengeResult = (operationId: string, chalenge: Challenge, results: Record<string, Record<string, number>>, expectedResult: string | number[]): ChalengeResult => {
  const exerciseResult = chalenge.exercises.map((exercise, index): ExerciseResult => {
    const userResult = Object.values(results[index] || {}).join('');
    return {
      challengeId: chalenge.challengeId,
      operationId,
      expectedResult: expectedResult[index],
      userResult,
      exercise,
    };
  });
  const correctAnswers = exerciseResult.filter((exercise) => String(exercise.expectedResult) === String(exercise.userResult)).length;
  return {
    challengeId: chalenge.challengeId,
    operationId,
    results: exerciseResult,
    time: 0,
    correctAnswers,
    successful: correctAnswers + 1 >= chalenge.exercises.length,
    coins: Math.ceil(correctAnswers === chalenge.exercises.length ? chalenge.coinsOnSuccess : chalenge.coinsOnFailure),
    xp: Math.ceil(chalenge.experiencePoints),
  };
};

const SingleLine: React.FC<SingleLineProps> = ({ challengeId, operationId }) => {
  const navigator = useNavigation<OperationSelectionScreenNavigationProp>();
  const dispatch = useDispatch();

  const operationConfig = operations.find((op) => op.operationId === operationId);
  const submitChalangeResults = (results: ChalengeResult)=>{
    dispatch(completeChalange(results))
  }

  const chalengeCoeficients: ChallengeCoeficients = {
    timeCoeficient: (operationConfig?.timeCoeficient || 1) * 0.2,
    coinCoeficient: (operationConfig?.xpCoeficient || 1) * 0.2,
    xpCoeficient: (operationConfig?.xpCoeficient || 1) * 0.2,

  }
  
  const challenge = challengeByOperationAndMinigame(challengeId, chalengeCoeficients)

  const [exercisePositions, setExercisePositions] = useState<ExerciseInputPosition[]>([]);
  const [exerciseResults, setExerciseResults] = useState<Record<string, Record<string, number>>>({});

  const addResponse = (exerciseId: number, keyId: number, value: number) => {
    setExerciseResults(prev=>{
      const newResults = {...prev};
      if(!newResults[exerciseId]) newResults[exerciseId] = {};
      newResults[exerciseId][keyId] = value;
      return newResults;
    });
  }

  if (!challenge || !operationConfig) {
    return <Text>Challenge or Operation not found.</Text>;
  }

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const { getResult, resultIsFirst, symbol } = operationConfig;

  const exercises = challenge.exercises;

  const handleAnswer = (answer: number) => {
    if(currentExerciseIndex === exercises.length - 1){
      const expectedResults = exercises.map((exercise) => getResult(exercise.slice(0, 2)));
      const results = getChalengeResult(operationId, challenge, exerciseResults, expectedResults);
      
      if(results.correctAnswers +1 >= challenge.exercises.length) {
        submitChalangeResults(results);
      }
        navigator.navigate('ChallengeResult', results);
    } else {
      setExercisePositions([]);
      setCurrentExerciseIndex(currentExerciseIndex + 1); 
    }
  };

  return (
    <HalvingLayout
    upperPercentage={75}
      UpperComponent={(
        <Exercise
          complexity={2}
          exercise={exercises[currentExerciseIndex]}
          exerciseId={currentExerciseIndex}
          exerciseResult={exerciseResults[currentExerciseIndex]}
          onAnswer={handleAnswer}
          operation={operationConfig}
          exercisePositions={exercisePositions}
          resultIsFirst={resultIsFirst}
          updateExercisePositions={(exPositions: ExerciseInputPosition[], exerciseIndex: number) => {
            setExercisePositions(prev=>{
              const newPositions = prev.filter(pos=>pos.exerciseIndex !== exerciseIndex);
              return [...newPositions, ...exPositions];
            }); 
          }}
        />
      )}
      LowerComponent={(
        <MinigameKeyboard
          key={computePositionKey(exercisePositions)}
          handleDrop={(exercisePosition, value) => addResponse(exercisePosition.exerciseIndex, exercisePosition.inputIndex, value)}
          exercisePositions={exercisePositions}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    userSelect: 'none',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    userSelect: 'none',
  },
  exerciseValues: {
    flexDirection: 'row',
    alignItems: 'center',
    userSelect: 'none',
  },
  exerciseValue: {
    flexDirection: 'row',
    alignItems: 'center',
    userSelect: 'none',
  },
});

export default SingleLine;
