import React, { FC, LegacyRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, GestureResponderEvent, PanResponderGestureState, LayoutChangeEvent, PanResponder, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { operations } from '../../configs/operations';
import { ExerciseInputPosition } from '@/src/types/Chalenge';
import { useNavigation } from 'expo-router';

interface ExerciseProps {
  exercise: number[];
  exerciseId: number;
  exerciseResult: Record<string, number>;
  exercisePositions: ExerciseInputPosition[];
  complexity: number;
  operationSymbol: string;
  resultIsFirst: boolean;
  onAnswer: (answer: number) => void;
  result: number;
  updateExercisePositions: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
}

type DigitProps = {
  value?: string;
  updateExercisePositions?: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
  exercisePositions?: ExerciseInputPosition[];
  forwardRef?: (ref: View | null) => void;
  exerciseId: number;
};

interface DraggableProps {
  renderText: string;
  onDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
  onDragRelease: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
}

const Draggable: React.FC<DraggableProps> = ({ renderText, onDrag, onDragRelease }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Apply initial offset for better visibility under the finger
        position.setOffset({
          x: position.x._value,
          y: position.y._value - 50,
        });
        position.setValue({ x: 0, y: 0 }); // reset so drag starts from (0,0)
      },
      onPanResponderMove: (event, gestureState) => {
        Animated.event([null, { dx: position.x, dy: position.y }], {
          useNativeDriver: false,
        })(event, gestureState);
        onDrag(event, gestureState);
      },
      onPanResponderRelease: (event, gestureState) => {
        onDragRelease(event, gestureState);
        position.flattenOffset();
        // Animate back to the original position
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        // Fallback for any unintentional release to return to the initial position
        Animated.spring(position, {
          toValue: { x: initialPosition?.x || 0, y: initialPosition?.y || 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.draggable, { transform: position.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.draggableText}>{renderText}</Text>
    </Animated.View>
  );
};

const Digit: FC<DigitProps> = ({value, forwardRef})=> (
  <View style={styles.digitContainer} ref={(refI)=>{
    if(forwardRef) forwardRef(refI);
    }}>
    <Text style={styles.digit}>{value || '?'}</Text>
  </View>
);


const computePositionIndex = (pos: ExerciseInputPosition[]) => pos.sort((a,b)=>a.inputIndex - b.inputIndex).map((item)=>`${item.x}-${item.y}`).join('__');


const ValueToDigits:FC<DigitProps> = ({value, updateExercisePositions, exercisePositions = [], exerciseId})=>{
    
  const refferenceDigits = useRef<(View | null)[]>([]);
  const [layoutsReady, setLayoutsReady] = useState<number[]>();

  console.log(103, value, exercisePositions);
  useEffect(() => {
    setLayoutsReady([]);
  }, [value]);

  useEffect(()=>{
    const measurePositions = async ()=>{
    const localPositions: ExerciseInputPosition[] = []; 
    console.log(108, refferenceDigits.current, exerciseId);
    for(let index = 0; index < refferenceDigits.current.length; index++){
      const ref = refferenceDigits.current[index];
      if(ref){
        const position = await new Promise<ExerciseInputPosition>((resolve) => {
          ref.measure((x, y, width, height, pageX, pageY) => {
            resolve({ x: pageX, y: pageY, width, exerciseIndex: 0, inputIndex: index });
          });
        });
        if(position) localPositions.push(position);
      }
    }
    console.log(120, localPositions, exercisePositions, value);
    if(updateExercisePositions && localPositions.length >= String(value).length){
      console.log(118, localPositions, exercisePositions);
      if(computePositionIndex(localPositions) !== computePositionIndex(exercisePositions)){
        updateExercisePositions(localPositions, 0);
      }
    }
  }
  if(layoutsReady?.length === String(value).length){
    measurePositions();
  }
  }, [refferenceDigits.current, updateExercisePositions, value, JSON.stringify(exercisePositions), layoutsReady]);

  return <>{String(value).split('').map((v,index)=>(
    <View key={`${index}_${computePositionIndex(exercisePositions)}_${value}`}  onLayout={()=>setLayoutsReady(prev=>prev?.includes(index)? prev : [...(prev || []), index])}>
      <Digit value={v} forwardRef={(ref)=>{
        refferenceDigits.current[index] = ref;
      }}
      exerciseId={exerciseId}
    />
    </View>
  ))}</>;
};

type ExerciseValuesProps = {
  values: (number| string)[];
  operationSymbol: string;
  exerciseId: number;
};

const ExerciseValues: FC<ExerciseValuesProps> = ({ values, operationSymbol, exerciseId }) => {
  return (
    <View style={styles.exerciseValues}>
      {values.map((value, index) => (
        <View key={index} style={styles.exerciseValue} >
          <ValueToDigits value={String(value)}
            exerciseId={exerciseId}
          />
          {index < values.length - 1 && <ValueToDigits value={operationSymbol} exerciseId={exerciseId}/>}
        </View>
      ))}
    </View>
  );
} 

type ResultValueProps = {
  value: number | string;
  updateExercisePositions: (exercisePositions: ExerciseInputPosition[], exerciseId: number) => void;
  result?: Record<string, number>;
  exerciseId: number;
  exercisePositions: ExerciseInputPosition[];
};

const ResultValue: FC<ResultValueProps> = ({ value, updateExercisePositions, result, exerciseId, exercisePositions }) => {
  const exerciseIdRef = useRef(exerciseId);
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  const partialResult = useMemo(() => {
    return String(value).split('').map((v, i) => result && result[i] ? result[i] : '?').join('');
  }, [value, Object.values(result || {}).join('')]);
  console.log(172, partialResult, result, exercisePositions, exerciseId);
  return (
    <View style={styles.resultValue}>
      <ValueToDigits
        value={partialResult}
        updateExercisePositions={updateExercisePositions}
        exercisePositions={exercisePositions}
        exerciseId={exerciseId}
      />
    </View>
  );
};

const Exercise: FC<ExerciseProps> = ({ exercise, operationSymbol, resultIsFirst, result, onAnswer, complexity, updateExercisePositions, exerciseResult, exerciseId, exercisePositions }) => {
  const exerciseIdRef = useRef(exerciseId);
  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

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
  
  useEffect(() => {
    const answer = Object.values(exerciseResult || {});
    if (answer.length === String(resultItem).length) {
      onAnswer(Number(answer.join('')));
    }
  }, [exerciseResult, resultItem, onAnswer]);

  console.log(222, resultItem, exerciseResult, exerciseIdRef.current, exercisePositions);

  return (
    <View style={styles.exerciseContainer}>
      <ExerciseValues values={exerciseItems} operationSymbol={operationSymbol} exerciseId={exerciseId}/>
      <ExerciseValues values={['=']} operationSymbol={''} exerciseId={exerciseId} />
      <ResultValue
        value={resultItem}
        updateExercisePositions={(exercisePositions) => updateExercisePositions(exercisePositions.map(item=>({...item, exerciseIndex: exerciseIdRef.current})), exerciseIdRef.current)}
        result={exerciseResult}
        exerciseId={exerciseId}
        exercisePositions={exercisePositions}
      />
    </View>
  );
};


const getClosestCell = (x: number, y: number, exercisePositions: ExerciseInputPosition[]) => {
  const closest = exercisePositions.reduce((closest, current) => {
    const distance = Math.sqrt((x - current.x) ** 2 + (y - current.y) ** 2);
    if (distance < closest.distance) {
      return { distance, cell: current };
    }
    return closest;
  }, { distance: Infinity, cell: null } as { distance: number, cell: ExerciseInputPosition | null });
  if(closest.cell && closest.distance < closest.cell.width) {
    return closest.cell;
  }
  return null;
};

type KeyboardComponentProps = {
  handleDrop: (exercise: ExerciseInputPosition, value: number) => void;
  exercisePositions: ExerciseInputPosition[];
};

const KeyboardComponent: FC<KeyboardComponentProps> = ({ handleDrop, exercisePositions }) => {
  const digits = useMemo(() => Array.from({ length: 10 }, (_, index) => index === 9 ? 0 : index + 1), []);
  const handleDragEnd: (value: number, gestureState: PanResponderGestureState) => void = useCallback((value, gestureState) => {
    console.log(243, {...gestureState});
    const exerise = getClosestCell(gestureState.moveX, gestureState.moveY - 50, exercisePositions);
    if (exerise) {
      handleDrop(exerise, value);
    }
  }, [exercisePositions, handleDrop]);

  const handleDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void = useCallback((event, gestureState) => {
    // console.log('drag', gestureState.moveX, gestureState.moveY);
  }, []);
  return (
    <View style={styles.keyboardContainer}>
      {digits.map((digit, index) => (
          <Draggable
            key={`${digit}_${computePositionIndex(exercisePositions)}`}
            renderText={String(digit)}
            onDragRelease={(_event, gestureState)=> handleDragEnd(digit, gestureState)}
            onDrag={handleDrag}
          />
      ))}
    </View>
  );
}
interface SingleLineProps {
  challengeId: number;
  operationId: string;
}

const SingleLine: React.FC<SingleLineProps> = ({ challengeId, operationId }) => {
  const navigator = useNavigation();
  const challenge = useSelector((state: RootState) => 
    state.game.challenges.find((ch) => ch.challengeId === challengeId)
  );

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

  const operationConfig = operations.find(op => op.operationId === operationId);

  if (!challenge || !operationConfig) {
    return <Text>Challenge or Operation not found.</Text>;
  }

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const { getResult, resultIsFirst, symbol } = operationConfig;

  const exercises = challenge.exercises;

  const handleAnswer = (answer: number) => {
    if(currentExerciseIndex === exercises.length - 1){
      navigator.navigate('ChallengeResult', { challengeId });
    } else {
      setExercisePositions([]);
      setCurrentExerciseIndex(currentExerciseIndex + 1); 
    }
  };

  console.log(319, exerciseResults);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SingleLine Math Challenge</Text>
      
      <Exercise
        complexity={2}
        exercise={exercises[currentExerciseIndex]}
        exerciseId={currentExerciseIndex}
        exerciseResult={exerciseResults[currentExerciseIndex]}
        onAnswer={handleAnswer}
        operationSymbol={symbol}
        exercisePositions={exercisePositions}
        resultIsFirst={resultIsFirst}
        result={getResult(exercises[currentExerciseIndex].slice(0, 2))}
        updateExercisePositions={(exPositions: ExerciseInputPosition[], exerciseIndex: number) => {
          console.log(341, exPositions);
          setExercisePositions(prev=>{
            const newPositions = prev.filter(pos=>pos.exerciseIndex !== exerciseIndex);
            return [...newPositions, ...exPositions];
          }); 
        }}
      />
      <KeyboardComponent
        key={computePositionIndex(exercisePositions)}
        handleDrop={(exercisePosition, value) => console.log(333, exercisePosition, exercisePositions, addResponse(exercisePosition.exerciseIndex, exercisePosition.inputIndex, value))}
        exercisePositions={exercisePositions}
      />
    </View>
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
  resultValue: {
    marginLeft: 10,
  },
  digitContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 5,
    margin: 2,
    width: 30,
    height: 30,
  },
  digit: {
    fontSize: 18,
  },
  keyboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  draggable: {
    width: 50,
    height: 50,
    backgroundColor: '#f0a',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  draggableText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SingleLine;
