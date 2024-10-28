import { createContext, FC, useContext, useEffect, useState } from 'react';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Animated } from 'react-native';

type AnimatedImageProps = {
  image: any;
};

export const AnimatedImage: FC<AnimatedImageProps> = ({ image }) => {
  const scaleAnim = new Animated.Value(1);
  const translateXAnim = new Animated.Value(0);
  const translateYAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 11000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 13000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateXAnim, {
          toValue: -30,
          duration: 17000,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 30,
          duration: 19000,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 21000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateYAnim, {
          toValue: -30,
          duration: 23000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 30,
          duration: 33000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 29000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim, translateXAnim, translateYAnim]);
  return (
    <Animated.Image
      source={image}
      style={[
        styles.backgroundImage,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: translateXAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    />
  );
};

const AnimatedImageContext = createContext<{
  bgImage?: ImageSourcePropType;
  setBgImage: (image: ImageSourcePropType) => void;
}>({
  setBgImage: () => {},
});

export const useAnimatedBackground = (image: ImageSourcePropType) => {
  const context = useContext(AnimatedImageContext);
  if (!context) {
    throw new Error(
      'useAnimatedBackground must be used within a AnimatedImageContext',
    );
  }
  useEffect(() => {
    context.setBgImage(image);
  }, [image]);
  return context;
};

type AnimatedBackgroundProviderProps = {
  children: JSX.Element;
};

const AnimatedBackgroundProvider: FC<AnimatedBackgroundProviderProps> = ({
  children,
}) => {
  const [bgImage, setBgImage] = useState<ImageSourcePropType>();
  return (
    <View style={styles.container}>
      <AnimatedImageContext.Provider value={{ bgImage, setBgImage }}>
        <AnimatedImage image={bgImage} />
        <View style={styles.childrenWrapper} id="AnimatedImageBackground">
          {children}
        </View>
      </AnimatedImageContext.Provider>
    </View>
  );
};

export default AnimatedBackgroundProvider;

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    width: '120%',
    height: '110%',
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  childrenWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    flex: 1,
    alignContent: 'center',
    padding: 0,
    margin: 0,
  }
});
