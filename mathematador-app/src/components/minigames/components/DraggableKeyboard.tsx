import { FC, useRef, useState } from "react";
import { Animated, GestureResponderEvent, PanResponder, PanResponderGestureState, StyleSheet, Text, View } from "react-native";
import { computePositionKey } from "../helpers/computePositionKey";
import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { useScreenSizes } from "@/src/hooks/useScreenSizes";


interface DraggableKeyboardDigitProps {
    renderText: string;
    digitSize: number;
    orientation: 'landscape' | 'portrait';
    onDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
    onDragRelease: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
  }
  
const DraggableKeyboardDigit: React.FC<DraggableKeyboardDigitProps> = ({ renderText, onDrag, onDragRelease, digitSize, orientation }) => {
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
        style={[styles.draggable, {
          transform: position.getTranslateTransform(),
        }]}
        {...panResponder.panHandlers}
      >
        <View style={{position: 'relative'}} >
        <View
          style={{
            ...styles.draggableItem,
            width: Math.min(digitSize, 40),
            height: Math.min(digitSize, 40),
          }}
        >
          <Text style={styles.draggableText}>{renderText}</Text>
        </View>
        </View>
      </Animated.View>
    );
  };
  const styles = StyleSheet.create({
    draggableWrapper: {
      backgroundColor: '#f0a',
      borderWidth: 5,
      borderColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    },
    draggable: {
      userSelect: 'none',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    draggableItem: {
      backgroundColor: '#f0a',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    },
    draggableText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    keyboardContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      width: '100%',
      height: '100%',
      gap: 0,
    },
  });

const digits =Array.from({ length: 10 }, (_, index) => index === 9 ? 0 : index + 1);

type DraggableKeyboardProps = {
  exercisePositions: ExerciseInputPosition[];
  handleDragEnd: (value: number, gestureState: PanResponderGestureState) => void;
  handleDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
}

const DraggableKeyboard: FC<DraggableKeyboardProps> = ({
  exercisePositions,
  handleDragEnd,
  handleDrag,
}) => {
  
  const { secondarySize, orientation } =  useScreenSizes(75);
  const minSizePortrait = Math.min(secondarySize.width / 5, secondarySize.height / 2);
  const minSizeLandscape = secondarySize.height / 5;
  const digitSize = orientation === 'landscape' ? minSizeLandscape : minSizePortrait;
  return (
  <View style={styles.keyboardContainer}>
  {digits.map((digit, index) => (
    <View
      style={{
        ... styles.draggableWrapper,
        width: orientation !== 'landscape' ? digitSize : '50%',
        height: orientation === 'landscape' ? digitSize : '50%',
    flexBasis: orientation !== 'landscape' ? '20%' : '50%',
      }}
    >
      <DraggableKeyboardDigit
        key={`${digit}_${computePositionKey(exercisePositions)}`}
        renderText={String(digit)}
        orientation={orientation}
        digitSize={digitSize}
        onDragRelease={(_event, gestureState)=> handleDragEnd(digit, gestureState)}
        onDrag={handleDrag}
      />
      </View>
  ))}
</View>
);
};


  export default DraggableKeyboard;
