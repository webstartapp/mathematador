import { useEventListener } from "expo";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useVideoPlayer, VideoView } from "expo-video";
import { JSX, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import introVideoAsset from "@/assets/video/intro.mp4";
import { useMenuMusic } from "@/hooks/useMenuMusic";
import { RootStackParamList } from "@/types/Navigation";

type IntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Intro"
>;

const SKIP_BUTTON_DELAY_MS = 2000;

const IntroScreen = (): JSX.Element => {
  const navigation = useNavigation<IntroScreenNavigationProp>();
  const { start: startMenuMusic, stop: stopMenuMusic } = useMenuMusic();
  const [showSkip, setShowSkip] = useState(false);

  const player = useVideoPlayer(introVideoAsset, (playerInstance) => {
    playerInstance.muted = true;
  });

  const goToHome = (): void => {
    navigation.replace("Home");
  };

  useEventListener(player, "playToEnd", goToHome);
  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "error") {
      goToHome();
    }
  });

  useEffect(() => {
    // Calling play() from the useVideoPlayer setup callback fires before the
    // VideoView's underlying <video> element is attached on web, so playback
    // never actually starts - call it after mount instead.
    player.play();
    startMenuMusic();
    const skipTimeoutId = setTimeout(
      () => setShowSkip(true),
      SKIP_BUTTON_DELAY_MS,
    );
    return () => {
      clearTimeout(skipTimeoutId);
      stopMenuMusic();
    };
  }, [player, startMenuMusic, stopMenuMusic]);

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
