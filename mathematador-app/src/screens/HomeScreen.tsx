import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { JSX } from "react";
import { useSelector } from "react-redux";

import imageBG from "@/assets/images/intro-screen.png";
import Button from "@/components/common/Button";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { RootState } from "@/redux/store";
import { RootStackParamList } from "@/types/Navigation";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = (): JSX.Element => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user);

  const handleStartGame = (): void => {
    navigation.navigate("SelectOperation");
  };

  return (
    <Layout>
      <CenteredDesk
        title={`Welcome, ${user.name}`}
        subtitles={[`Level ${user.level}`, `XP: ${user.xp}`]}
      >
        <Button title="Start Game" onPress={handleStartGame} />
      </CenteredDesk>
    </Layout>
  );
};

export default HomeScreen;
