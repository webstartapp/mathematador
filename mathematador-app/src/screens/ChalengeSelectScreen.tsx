import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation, RouteProp } from "expo-router/react-navigation";
import { JSX } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";

import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { operations } from "@/configs/operations";
import { RootState } from "@/redux/store";
import { styles } from "@/theme";
import { Challenge } from "@/types/Chalenge";
import { RootStackParamList } from "@/types/Navigation";

type ChalengeSelectScreenRouteProp = RouteProp<
  RootStackParamList,
  "ChalengeSelect"
>;
type ChalengeSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChalengeSelect"
>;

interface Props {
  route: ChalengeSelectScreenRouteProp;
}

const ChalengeSelect = ({ route }: Props): JSX.Element => {
  const { operationId } = route.params;
  const navigation = useNavigation<ChalengeSelectScreenNavigationProp>();

  // Retrieve challenges for the selected operation from Redux
  const operationStatistics = useSelector((state: RootState) =>
    state.user.operationProgress.find(
      (operation) => operation.operationId === operationId,
    ),
  );
  const operation = operations.find(
    (operationItem) => operationItem.operationId === operationId,
  );
  const currentChallenge = operationStatistics?.currentChallenge;
  const completedChallenges = operationStatistics?.completedChallenges;

  // eslint-disable-next-line no-console
  console.log(34, operationStatistics);

  // Start button handler
  const handleStartChallenge = (challenge?: Challenge): void => {
    if (challenge) {
      navigation.navigate("Challenge", challenge);
    }
  };

  return (
    <Layout>
      <View style={styles.chalengeSelectContainer}>
        <CenteredDesk
          title={`Operation: ${operationId}`}
          subtitles={[
            `Challenge: ${currentChallenge?.challengeOrderId || 1}`,
            `Level: ${currentChallenge?.level || 1}`,
          ]}
          descriptions={[operation?.description || ""]}
        >
          <Button
            title="Start"
            onPress={() => handleStartChallenge(currentChallenge)}
          />
        </CenteredDesk>
        <View style={styles.chalengeSelectCurrentContainer}>
          <CenteredDesk title="Completed Challenges" />
        </View>
        <View style={styles.chalengeSelectBoxContainer}>
          {completedChallenges?.map((challenge) => (
            <View
              style={styles.chalengeSelectBox}
              key={challenge.challengeOrderId}
              id="challengeBox"
            >
              <CenteredDesk
                title={`Challenge ${challenge.challengeOrderId}`}
                styles={{
                  container: {
                    marginBottom: 10,
                    width: "100%",
                  },
                }}
                subtitles={[
                  `Level: ${challenge.level}`,
                  `Answers: ${challenge.correctAnswers}/${challenge.results.length}`,
                  `Time: ${challenge.time} seconds`,
                ]}
              >
                <Button
                  title="Repeat"
                  onPress={() => handleStartChallenge(challenge)}
                />
              </CenteredDesk>
            </View>
          ))}
        </View>
      </View>
    </Layout>
  );
};

export default ChalengeSelect;
