import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp } from "expo-router/react-navigation";
import { JSX } from "react";
import { View, StyleSheet } from "react-native";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { operations } from "@/configs/operations";
import { RootStackParamList } from "@/types/Navigation";

type OperationSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChallengeResult"
>;

type LevelScreenRouteProp = RouteProp<RootStackParamList, "ChallengeResult">;

type ChallengeResultScreenProps = {
  route: LevelScreenRouteProp;
};

const ChallengeResultScreen = ({
  route,
}: ChallengeResultScreenProps): JSX.Element => {
  const {
    challengeOrderId,
    operationId,
    successful,
    results,
    time,
    correctAnswers,
    coins,
    xp,
  } = route.params;
  const navigation = useNavigation<OperationSelectionScreenNavigationProp>();

  const operation = operations.find(
    (operationItem) => operationItem.operationId === operationId,
  );

  const handleReturn = (): void => {
    navigation.navigate("ChalengeSelect", { operationId });
  };

  return (
    <Layout>
      <View style={styles.container}>
        <CenteredDesk
          styles={{
            wrapper: {
              marginBottom: 40,
            },
          }}
          title={"Challenge Results"}
          subtitles={[
            `Challenge ID: ${challengeOrderId}`,
            successful ? "Success!" : "Try Again!",
          ]}
          descriptions={[
            `Operation: ${operationId}`,
            `Time Taken: ${time} seconds`,
            `Correct Answers: ${correctAnswers}/${results.length}`,
            `Coins Earned: ${coins}`,
            `XP Earned: ${xp}`,
          ]}
        >
          <Button title="Continue" onPress={handleReturn} />
        </CenteredDesk>
        <CenteredDesk
          styles={{
            wrapper: {
              marginBottom: 20,
            },
          }}
          title={"Exercise results"}
        />
        {results.map((result, index) => (
          <CenteredDesk
            styles={{
              wrapper: {
                marginBottom: 20,
              },
            }}
            title={`Exercise ${index + 1}`}
            subtitles={[
              `Expected Result: ${result.expectedResult}`,
              `Your Result: ${result.userResult}`,
              `${result.exercise.join(" " + operation?.symbol + " ")}=${String(
                result.expectedResult,
              )
                .split("")
                .map(() => "?")
                .join("")}`,
              `Status: ${result.expectedResult === result.userResult ? "Correct" : "Incorrect"}`,
            ]}
            key={`Exercise_index_${index}_${result.expectedResult}`}
          />
        ))}
      </View>
    </Layout>
  );
};

export default ChallengeResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
