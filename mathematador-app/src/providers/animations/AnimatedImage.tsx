import {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  View,
  Animated,
  Platform,
} from "react-native";

type AnimatedImageProps = {
  image: ImageSourcePropType | undefined;
};

export const AnimatedImage: FC<AnimatedImageProps> = ({ image }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimLoop = (
      anim: Animated.Value,
      sequence: { toValue: number; duration: number }[],
    ): void => {
      Animated.loop(
        Animated.sequence(
          sequence.map((step) =>
            Animated.timing(anim, {
              ...step,
              // react-native-web has no native animation driver and warns
              // on every setup that requests one - only native platforms
              // get the perf benefit, matching this file's other Animated
              // usages that are already platform-gated the same way.
              useNativeDriver: Platform.OS !== "web",
            }),
          ),
        ),
      ).start();
    };

    startAnimLoop(scaleAnim, [
      { toValue: 1.1, duration: 11000 },
      { toValue: 1, duration: 13000 },
    ]);
    startAnimLoop(translateXAnim, [
      { toValue: -30, duration: 17000 },
      { toValue: 30, duration: 19000 },
      { toValue: 0, duration: 21000 },
    ]);
    startAnimLoop(translateYAnim, [
      { toValue: -30, duration: 23000 },
      { toValue: 30, duration: 33000 },
      { toValue: 0, duration: 29000 },
    ]);
  }, [scaleAnim, translateXAnim, translateYAnim]);

  if (!image) {
    return null;
  }

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

export interface AnimatedImageContextType {
  bgImage?: ImageSourcePropType;
  setBgImage: (image: ImageSourcePropType) => void;
}

const AnimatedImageContext = createContext<AnimatedImageContextType>({
  setBgImage: () => {},
});

export const useAnimatedBackground = (
  image: ImageSourcePropType,
): AnimatedImageContextType => {
  const context = useContext(AnimatedImageContext);
  if (!context) {
    throw new Error(
      "useAnimatedBackground must be used within a AnimatedImageContext",
    );
  }
  useEffect(() => {
    context.setBgImage(image);
  }, [image, context]);
  return context;
};

type AnimatedBackgroundProviderProps = {
  children: ReactNode;
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
    position: "absolute",
    width: "120%",
    height: "110%",
  },
  container: {
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  childrenWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    display: "flex",
    flex: 1,
    alignContent: "center",
    padding: 0,
    margin: 0,
  },
});
