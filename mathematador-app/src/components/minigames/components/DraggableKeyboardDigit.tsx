import { FC, useEffect, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TAP_MOVEMENT_THRESHOLD = 6;

interface DraggableKeyboardDigitProps {
  renderText: string;
  digitSize: number;
  onDrag: (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => void;
  onDragRelease: (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => void;
  onTap: () => void;
  isSelected?: boolean;
}

export const DraggableKeyboardDigit: FC<DraggableKeyboardDigitProps> = ({
  renderText,
  onDrag,
  onDragRelease,
  onTap,
  isSelected,
  digitSize,
}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const xListener = position.x.addListener(({ value }) => {
      offsetRef.current.x = value;
    });
    const yListener = position.y.addListener(({ value }) => {
      offsetRef.current.y = value;
    });
    return () => {
      position.x.removeListener(xListener);
      position.y.removeListener(yListener);
    };
  }, [position]);

  const initialPosition = { x: 0, y: 0 };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Apply initial offset for better visibility under the finger
        position.setOffset({
          x: offsetRef.current.x,
          y: offsetRef.current.y - 50,
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
        const wasTap =
          Math.abs(gestureState.dx) < TAP_MOVEMENT_THRESHOLD &&
          Math.abs(gestureState.dy) < TAP_MOVEMENT_THRESHOLD;
        if (wasTap) {
          onTap();
        } else {
          onDragRelease(event, gestureState);
        }
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
          toValue: initialPosition,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.draggable,
        {
          transform: position.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={{ position: "relative" }}>
        <View
          style={{
            ...styles.draggableItem,
            ...(isSelected ? styles.selectedDraggableItem : null),
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
  draggable: {
    userSelect: "none",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  draggableItem: {
    backgroundColor: "#d49b57",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedDraggableItem: {
    borderColor: "#FFD700",
    backgroundColor: "#e8b06f",
  },
  draggableText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
