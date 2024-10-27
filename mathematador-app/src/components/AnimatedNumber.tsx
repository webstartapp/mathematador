import { headerStyles } from '@/styles/headerStyles';
import { layoutStyles } from '@/styles/layoutStyles';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

type AnimatedNumberProps = {
  startValue: number;
  targetValue: number;
  duration?: number; // Optional: duration of the animation in milliseconds
};

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  startValue,
  targetValue,
  duration = 1000,
}) => {
  const animatedValue = useRef(new Animated.Value(startValue)).current;
  const [displayValue, setDisplayValue] = useState(startValue);

  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: targetValue,
      duration: duration,
      useNativeDriver: false, // For animating numeric values
    });

    animation.start();

    // Listen to the animated value and round it before setting the state
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    // Cleanup listener on unmount
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [startValue, targetValue]);

  return (
    <View>
      <Animated.Text style={headerStyles.whiteText}>
        {displayValue}
      </Animated.Text>
    </View>
  );
};
export default AnimatedNumber;
