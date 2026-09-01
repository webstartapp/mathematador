import { useEventListener } from "expo";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { useVideoPlayer, VideoView } from "expo-video";
import { JSX, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import introVideoAsset from "@/assets/video/intro.mp4";
import { useMenuMusic } from "@/hooks/useMenuMusic";
import { RootStackParamList } from "@/types/Navigation";

type IntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Intro"
>;

const SKIP_BUTTON_DELAY_MS = 2000;
// Upper bound on how long the native splash (a static image - expo-splash-
// screen has no video/animation support) stays up waiting for the video to
// buffer, so a slow connection never leaves the user stuck looking at it.
const SPLASH_SAFETY_TIMEOUT_MS = 4000;

const IntroScreen = (): JSX.Element => {
  const navigation = useNavigation<IntroScreenNavigationProp>();
  const { start: startMenuMusic, stop: stopMenuMusic } = useMenuMusic();
  const [showSkip, setShowSkip] = useState(false);
  const splashHiddenRef = useRef(false);

  const player = useVideoPlayer(introVideoAsset, (playerInstance) => {
    playerInstance.muted = true;
  });

  const hideSplash = (): void => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    SplashScreen.hideAsync();
  };

  const goToHome = (): void => {
    // Stop the music here, deterministically, before the screen starts
    // unmounting - relying on the effect cleanup below instead raced
    // expo-audio's own auto-release-on-unmount and crashed (native only):
    // the player was already released by the time cleanup called pause().
    stopMenuMusic();
    navigation.replace("Home");
  };

  useEventListener(player, "playToEnd", goToHome);
  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") {
      hideSplash();
    }
    if (status === "error") {
      hideSplash();
      goToHome();
    }
  });

  useEffect(() => {
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
    const skipTimeoutId = setTimeout(
      () => setShowSkip(true),
      SKIP_BUTTON_DELAY_MS,
    );
    const splashSafetyTimeoutId = setTimeout(
      hideSplash,
      SPLASH_SAFETY_TIMEOUT_MS,
    );
    return () => {
      clearTimeout(skipTimeoutId);
      clearTimeout(splashSafetyTimeoutId);
    };
  }, [player, startMenuMusic]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      {showSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={goToHome}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  skipButton: {
    position: "absolute",
    bottom: 40,
    right: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default IntroScreen;
