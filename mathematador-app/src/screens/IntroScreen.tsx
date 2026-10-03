import { useEventListener } from "expo";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp, useRoute } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { useVideoPlayer, VideoView } from "expo-video";
import { JSX, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import logoImage from "@/assets/images/logo.png";
import woodButtonTexture from "@/assets/images/wood-button-texture.png";
import introVideoAsset from "@/assets/video/intro.mp4";
import { useMenuMusic } from "@/hooks/useMenuMusic";
import { useSessionVerification } from "@/hooks/useSessionVerification";
import { markIntroPlayed } from "@/navigation/introSession";
import { styles } from "@/theme";
import { RootStackParamList } from "@/types/Navigation";

type IntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Intro"
>;
type IntroScreenRouteProp = RouteProp<RootStackParamList, "Intro">;

// Carries introSkipButton's own position:absolute styling directly (merged
// with its animated opacity) instead of wrapping it in a separate
// Animated.View - an extra wrapper with no size of its own would become
// the containing block for that position:absolute style, which broke the
// button on native layouts once already (see introOverlay's own comment
// in theme.ts for the full story).
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const SKIP_BUTTON_DELAY_MS = 2000;
const SKIP_BUTTON_FADE_MS = 800;
// Earlier and slower than the skip button - the logo is the brand moment,
// the skip button is secondary chrome, so they're deliberately not tied to
// the same timing/Animated.Value.
const LOGO_FADE_DELAY_MS = 1000;
const LOGO_FADE_DURATION_MS = 1800;
// Upper bound on how long the native splash (a static image - expo-splash-
// screen has no video/animation support) stays up waiting for the video to
// buffer, so a slow connection never leaves the user stuck looking at it.
const SPLASH_SAFETY_TIMEOUT_MS = 4000;

const IntroScreen = (): JSX.Element => {
  const navigation = useNavigation<IntroScreenNavigationProp>();
  const route = useRoute<IntroScreenRouteProp>();
  const nextRoute = route.params?.nextRoute ?? "Home";
  const { start: startMenuMusic } = useMenuMusic();
  const [showSkip, setShowSkip] = useState(false);
  const [videoWantsNext, setVideoWantsNext] = useState(false);
  const splashHiddenRef = useRef(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const verificationOutcome = useSessionVerification();

  const player = useVideoPlayer(introVideoAsset, (playerInstance) => {
    playerInstance.muted = true;
  });

  const hideSplash = (): void => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    SplashScreen.hideAsync();
  };

  // The video ending (or being skipped) is only half of "ready to move on" -
  // a persisted user.id is unverified client state (see useSessionVerification),
  // so this waits for that check too before actually navigating. On
  // "blocked" (a confirmed-invalid session) this deliberately never
  // navigates - logout() already flipped isAuthenticated to false, and
  // app/index.tsx reactively swaps this whole stack out for AuthStack.
  const requestNext = (): void => {
    setVideoWantsNext(true);
  };

  useEffect(() => {
    if (videoWantsNext && verificationOutcome === "proceed") {
      navigation.replace(nextRoute);
    }
  }, [videoWantsNext, verificationOutcome, navigation, nextRoute]);

  useEventListener(player, "playToEnd", requestNext);
  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") {
      hideSplash();
    }
    if (status === "error") {
      hideSplash();
      requestNext();
    }
  });

  useEffect(() => {
    markIntroPlayed();
    // Calling play() from the useVideoPlayer setup callback fires before the
    // VideoView's underlying <video> element is attached on web, so playback
    // never actually starts - call it after mount instead.
    player.play();
    // Covers the (unlikely) case where the player was already ready before
    // the statusChange listener above had subscribed.
    if (player.status === "readyToPlay") {
      hideSplash();
    }
    startMenuMusic();
    // react-native-web has no native animation driver - see
    // AnimatedImage.tsx's identical gating for the same warning.
    const useNativeDriver = Platform.OS !== "web";
    const logoTimeoutId = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: LOGO_FADE_DURATION_MS,
        useNativeDriver,
      }).start();
    }, LOGO_FADE_DELAY_MS);
    const skipTimeoutId = setTimeout(() => {
      setShowSkip(true);
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: SKIP_BUTTON_FADE_MS,
        useNativeDriver,
      }).start();
    }, SKIP_BUTTON_DELAY_MS);
    const splashSafetyTimeoutId = setTimeout(
      hideSplash,
      SPLASH_SAFETY_TIMEOUT_MS,
    );
    return () => {
      clearTimeout(logoTimeoutId);
      clearTimeout(skipTimeoutId);
      clearTimeout(splashSafetyTimeoutId);
    };
  }, [player, startMenuMusic, logoOpacity, skipOpacity]);

  return (
    <View style={styles.introContainer}>
      <VideoView
        style={styles.fullBleed}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.introOverlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.introLogoWrapper, { opacity: logoOpacity }]}
          pointerEvents="none"
        >
          <Image
            source={logoImage}
            style={styles.introLogoImage}
            resizeMode="contain"
          />
        </Animated.View>
        {showSkip && (
          <AnimatedTouchableOpacity
            style={[styles.introSkipButton, { opacity: skipOpacity }]}
            onPress={requestNext}
          >
            <ImageBackground
              source={woodButtonTexture}
              style={styles.introSkipButtonTexture}
              resizeMode="cover"
            >
              <Text style={styles.introSkipText}>Skip</Text>
            </ImageBackground>
          </AnimatedTouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default IntroScreen;
