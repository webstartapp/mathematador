import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp, useRoute } from "expo-router/react-navigation";
import { JSX } from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";

import Layout from "@/components/common/Layout";
import { minigames } from "@/configs/minigames";
import { completeChalange } from "@/redux/slices/userSlice";
import { RootStackParamList } from "@/types/Navigation";

type ChallengeScreenRouteProp = RouteProp<RootStackParamList, "Challenge">;
type ChallengeScreenNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Challenge"
>;

const ChallengeScreen = (): JSX.Element => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigator = useNavigation<ChallengeScreenNavigationProps>();
  const challenge = route.params;
  const dispatch = useDispatch();

  // Get the appropriate minigame based on challengeId
  const minigame = minigames.find(
    (minigame) => minigame.id === challenge.minigame,
  );
  const MinigameComponent = minigame?.component;

  return (
    <Layout>
      <View style={styles.content} id="im content">
        {MinigameComponent ? (
          <MinigameComponent
            challenge={challenge}
            submitResults={(result) => {
              // eslint-disable-next-line no-console
              console.log(37, result);
              dispatch(completeChalange(result));
              navigator.navigate("ChallengeResult", result);
            }}
          />
        ) : null}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});

export default ChallengeScreen;
