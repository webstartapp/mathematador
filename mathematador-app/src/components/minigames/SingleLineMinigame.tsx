import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Operation, operations } from '../../configs/operations';
import { ChalengeResult, Challenge, ExerciseInputPosition, ExerciseResult } from '@/src/types/Chalenge';
import MinigameKeyboard from './components/MinigameKeyboard';
import { computePositionKey } from './helpers/computePositionKey';
import ExerciseValueDropDigits from './components/ExerciseValueDropDigits';
import ExerciseValuePreview from './components/ExerciseValuePreview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/src/types/Navigation';
import HalvingLayout from './components/HalvingLayout';
import { MinigameComponentProps } from '@/src/configs/minigames';

interface ExerciseProps {
  exerciseId: number;
  challenge: Challenge;
  exerciseResult: Record<string, number>;
  exercisePositions: ExerciseInputPosition[];
  onAnswer: (answer: number) => void;
  updateExercisePositions: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
}

const Exercise: FC<ExerciseProps> = ({ challenge, onAnswer, updateExercisePositions, exerciseResult, exerciseId, exercisePositions }) => {
  const exerciseIdRef = useRef(exerciseId);
  const operation = operations.find((op) => op.operationId === challenge.operationId);
  const exercise = challenge.exercises[exerciseId];
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  const result = useMemo(() => operation?.getResult(exercise), [exercise, operation]);

  const exerciseItems = useMemo(() => {
    const exerciseList = [
      ...(operation?.resultIsFirst ? [result] : exercise),
      ...(!operation?.resultIsFirst ? exercise : [result]),
    ];
    return exerciseList.slice(0, exerciseList.length - 2);
  }, [exercise, operation, result]);

  const resultItem = useMemo(() => {
    return operation?.resultIsFirst ? exerciseItems[exerciseItems.length - 1] : result;
  }, [exerciseItems, result, operation]);
  
  useEffect(() => {
    const answer = Object.values(exerciseResult || {});
    if (answer.length === String(resultItem).length) {
      onAnswer(Number(answer.join('')));
    }
  }, [exerciseResult, resultItem, onAnswer]);

  return (
    <View style={styles.exerciseContainer}>
      {exerciseItems?.map((item, index) => (
        <View style={styles.exerciseValues} key={`${item}_${index}`}>
          <View key={index} style={styles.exerciseValue} >
            <ExerciseValuePreview value={String(item)}
              exerciseId={exerciseId}
            />
            {index < exerciseItems.length - 1 && <ExerciseValuePreview value={operation?.symbol} exerciseId={exerciseId}/>}
          </View>
        </View>
      ))}
      <ExerciseValuePreview value={'='} exerciseId={exerciseId} /> 
      <ExerciseValueDropDigits
        value={resultItem || 0}
        updateExercisePositions={(exercisePositions) => updateExercisePositions(exercisePositions.map(item=>({...item, exerciseIndex: exerciseIdRef.current})), exerciseIdRef.current)}
        result={exerciseResult}
        exerciseId={exerciseId}
        exercisePositions={exercisePositions}
      />
    </View>
  );
};

const getChalengeResult = (chalenge: Challenge, results: Record<string, Record<string, number>>, expectedResult: string | number[]): ChalengeResult => {
  const exerciseResult: ExerciseResult[] = chalenge.exercises.map((exercise, index): ExerciseResult => {
    const userResult = Object.values(results[index] || {}).join('');
    return {
      expectedResult: expectedResult[index],
      userResult,
      exercise,
    };
  });
  const correctAnswers = exerciseResult.filter((exercise) => String(exercise.expectedResult) === String(exercise.userResult)).length;
  return {
    ...chalenge,
    results: exerciseResult,
    time: 0,
    correctAnswers,
    successful: correctAnswers + 1 >= chalenge.exercises.length,
    coins: Math.ceil(correctAnswers === chalenge.exercises.length ? chalenge.coinsOnSuccess : chalenge.coinsOnFailure),
    xp: Math.ceil(chalenge.experiencePoints),
  };
};

const SingleLine: React.FC<MinigameComponentProps> = ({ challenge, submitResults }) => {

  const operationConfig = operations.find((op) => op.operationId === challenge.operationId);

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

  const handleAnswer = () => {
    if(currentExerciseIndex === exercises.length - 1){
      const expectedResults = exercises.map((exercise) => getResult(exercise.slice(0, 2)));
      const results = getChalengeResult(challenge, exerciseResults, expectedResults);
      setExerciseResults({});
      submitResults(results, challenge);
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
          challenge={challenge}
          exerciseId={currentExerciseIndex}
          exerciseResult={exerciseResults[currentExerciseIndex]}
          onAnswer={handleAnswer}
          exercisePositions={exercisePositions}
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
