import React, { FC, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { operations } from '../../configs/operations';

interface ExerciseProps {
  exercise: number[];
  complexity: number;
  operationSymbol: string;
  resultIsFirst: boolean;
  onAnswer: (answer: number) => void;
  result: number;
}

type DigitProps = {
  value?: string;
};

const Digit: FC<DigitProps> = ({value})=> (
  <View style={styles.digitContainer}>
    <Text style={styles.digit}>{value || '?'}</Text>
  </View>
);

const ValueToDigits:FC<DigitProps> = ({value})=>{
  return <>{String(value).split('').map((v,i)=><Digit key={i} value={v} />)}</>;
};

const ExerciseValues: FC<{ values: (number| string)[], operationSymbol: string }> = ({ values, operationSymbol }) => {
  return (
    <View style={styles.exerciseValues}>
      {values.map((value, index) => (
        <View key={index} style={styles.exerciseValue}>
          <ValueToDigits value={String(value)} />
          {index < values.length - 1 && <ValueToDigits value={operationSymbol} />}
        </View>
      ))}
    </View>
  );
} 

const ResultValue: FC<{ value: number | string }> = ({ value }) => (
  <View style={styles.resultValue}>
    <ValueToDigits value={String(value).split('').map(v=>'?').join('')} />
  </View>
);

const Exercise: FC<ExerciseProps> = ({ exercise, operationSymbol, resultIsFirst, result, onAnswer, complexity }) => {
  const [answer, setAnswer] = useState<number>(0);

  const exerciseItems = useMemo(() => {
    const exerciseCut = exercise.slice(0, complexity);
    const exerciseList = [
      ...(resultIsFirst ? [result] : exerciseCut),
      ...(!resultIsFirst ? exerciseCut : [result]),
    ];
    return exerciseList.slice(0, exerciseList.length - 2);
  }, [exercise, complexity, result, resultIsFirst]);

  const resultItem = useMemo(() => {
    return resultIsFirst ? exerciseItems[exerciseItems.length - 1] : result;
  }, [exerciseItems, result, resultIsFirst]);
  
  const handleChange = (text: string, index: number, length: number) => {
    const traverseIndex = length - index - 1;
    setAnswer(prev=> {
      const oldAnswer = String(prev || 0).split('').reverse();
      const newAnswer = Array(length).map((_, i) => traverseIndex === i ? text : oldAnswer[i] || '0');
      return Number(newAnswer.reverse().join(''));
    });
  };

  
  useEffect(() => {
    if (String(answer || '').length === String(resultItem).length) {
      onAnswer(answer);
    }
  }, [answer, resultItem, onAnswer]);
  return (
    <View style={styles.exerciseContainer}>
      <ExerciseValues values={exerciseItems} operationSymbol={operationSymbol} />
      <ExerciseValues values={['=']} operationSymbol={''} />
      <ResultValue value={resultItem} />
    </View>
  );
};

  



interface SingleLineProps {
  challengeId: number;
  operationId: string;
}

const SingleLine: React.FC<SingleLineProps> = ({ challengeId, operationId }) => {
  const challenge = useSelector((state: RootState) => 
    state.game.challenges.find((ch) => ch.challengeId === challengeId)
  );

  const operationConfig = operations.find(op => op.operationId === operationId);

  if (!challenge || !operationConfig) {
    return <Text>Challenge or Operation not found.</Text>;
  }

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const { getResult, resultIsFirst, symbol } = operationConfig;

  const exercises = challenge.exercises;

  const handleAnswer = (answer: number) => {
    const exercise = exercises[currentExerciseIndex];
    const expectedAnswer = getResult(exercise.slice(0, 2));
    
    if (answer === expectedAnswer) {
      Alert.alert("Correct!");
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        // Navigate to result or show completion message
        Alert.alert("Challenge Complete!");
      }
    } else {
      Alert.alert("Incorrect, try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SingleLine Math Challenge</Text>
      
      <Exercise
        complexity={2}
        exercise={exercises[currentExerciseIndex]}
        onAnswer={handleAnswer}
        operationSymbol={symbol}
        resultIsFirst={resultIsFirst}
        result={getResult(exercises[currentExerciseIndex].slice(0, 2))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
  },
  exerciseValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    marginLeft: 10,
  },
  digitContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 5,
    margin: 2,
  },
  digit: {
    fontSize: 18,
  },
});

export default SingleLine;
