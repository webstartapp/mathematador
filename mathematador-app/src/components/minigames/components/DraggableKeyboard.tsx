import { useRef, useState } from "react";
import { Animated, GestureResponderEvent, PanResponder, PanResponderGestureState, StyleSheet, Text } from "react-native";


interface DraggableKeyboardProps {
    renderText: string;
    onDrag: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
    onDragRelease: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
  }
  
  const DraggableKeyboard: React.FC<DraggableKeyboardProps> = ({ renderText, onDrag, onDragRelease }) => {
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
  const styles = StyleSheet.create({
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

  export default DraggableKeyboard;
