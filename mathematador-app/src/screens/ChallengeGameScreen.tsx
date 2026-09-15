/* eslint-disable max-lines */
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp, useRoute } from "expo-router/react-navigation";
import {
  useState,
  useEffect,
  useMemo,
  JSX,
  Dispatch,
  SetStateAction,
} from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useDispatch } from "react-redux";

import Layout from "@/components/common/Layout";
import { getToroHintText } from "@/components/minigames/helpers/getToroHint";
import ComboMeter from "@/components/toro/ComboMeter";
import {
  getComboTextForStreak,
  isHighComboMilestone,
} from "@/components/toro/comboMilestones";
import ComboPopup from "@/components/toro/ComboPopup";
import ComboRewardBurst from "@/components/toro/ComboRewardBurst";
import { useOleSound } from "@/components/toro/useOleSound";
import { minigames } from "@/configs/minigames";
import { completeChalange, syncProgress } from "@/redux/slices/userSlice";
import { challengeUpdateResult } from "@/src/_generated/api";
import { OperationId } from "@/src/_generated/model";
import { colors, spacing, styles } from "@/theme";
import {
  Challenge,
  ChalengeResult,
  Exercise as ExerciseType,
} from "@/types/Chalenge";
import { RootStackParamList } from "@/types/Navigation";

const toOperationId = (value: string): OperationId | undefined => {
  if (value === "addition") return value;
  if (value === "subtraction") return value;
  if (value === "multiplication") return value;
  if (value === "division") return value;
  if (value === "gauntlet") return value;
  if (value === "daily_challenge") return value;
  return undefined;
};

type ChallengeScreenRouteProp = RouteProp<RootStackParamList, "Challenge">;
type ChallengeScreenNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Challenge"
>;

interface ChallengeState {
  timeLeft: number;
  setTimeLeft: Dispatch<SetStateAction<number>>;
  streak: number;
  cooperation: number;
  comboText: string | null;
  burstKey: number;
  focusUsed: boolean;
  isFrozen: boolean;
  handleToroHint: () => void;
  handleToroFocus: () => void;
  handleAnswerSubmit: (isCorrect: boolean, expectedResult: number) => void;
  handleIndexChange: (index: number) => void;
}

const useChallengeState = (challenge: Challenge): ChallengeState => {
  const [timeLeft, setTimeLeft] = useState(challenge.maxTime || 60);
  const [streak, setStreak] = useState(0);
  const [cooperation, setCooperation] = useState(0);
  const [comboText, setComboText] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [focusUsed, setFocusUsed] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playOleSound = useOleSound();

  const handleToroHint = (): void => {
    if (cooperation < 100) return;

    const currentEx: ExerciseType = challenge.exercises[currentIndex];
    const hintText = getToroHintText(challenge.operationId, currentEx);
    Alert.alert("Toro Assist 🐂", hintText);
    setCooperation(0); // consume cooperation
  };

  const handleToroFocus = (): void => {
    if (focusUsed) return;

    setIsFrozen(true);
    setFocusUsed(true);
    setTimeout(() => {
      setIsFrozen(false);
    }, 3000);
  };

  useEffect(() => {
    const textVal = getComboTextForStreak(streak);
    if (textVal === null) return;
    setComboText(textVal);
    playOleSound();
    if (isHighComboMilestone(streak)) {
      setBurstKey((prevKey) => prevKey + 1);
    }
  }, [streak, playOleSound]);

  const handleAnswerSubmit = (
    isCorrect: boolean,
    _expectedResult: number,
  ): void => {
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setCooperation((prev) => Math.min(100, prev + 25)); // +25% per correct answer
    } else {
      setStreak(0);
      setComboText(null);
    }
  };

  const handleIndexChange = (index: number): void => {
    setCurrentIndex(index);
    setComboText(null);
  };

  return {
    timeLeft,
    setTimeLeft,
    streak,
    cooperation,
    comboText,
    burstKey,
    focusUsed,
    isFrozen,
    handleToroHint,
    handleToroFocus,
    handleAnswerSubmit,
    handleIndexChange,
  };
};

interface ChallengeTopBarProps {
  isFrozen: boolean;
  timeLeft: number;
  isToroInspired: boolean;
}

const ChallengeTopBar = ({
  isFrozen,
  timeLeft,
  isToroInspired,
}: ChallengeTopBarProps): JSX.Element => (
  <View style={styles.challengeTopBar}>
    <View style={[styles.overlayCardMedium, styles.challengeTimerContainer]}>
      <Ionicons
        name={isFrozen ? "snow-outline" : "timer-outline"}
        size={20}
        color={
          isFrozen ? colors.cyan : timeLeft <= 10 ? colors.danger : colors.white
        }
      />
      <Text
        style={[
          styles.challengeTimerText,
          isFrozen && styles.challengeFrozenText,
          timeLeft <= 10 && styles.challengeLowTimeText,
        ]}
      >
        {isFrozen ? "FROZEN" : `${timeLeft}s`}
      </Text>
    </View>

    {/* Toro Inspiration Badge */}
    {isToroInspired && (
      <View style={styles.challengeInspirationBadge}>
        <Ionicons name="flame" size={14} color={colors.gold} />
        <Text style={styles.challengeInspirationText}>Inspired (2x XP)</Text>
      </View>
    )}
  </View>
);

interface ToroPanelProps {
  cooperation: number;
  isToroInspired: boolean;
  handleToroHint: () => void;
  focusUsed: boolean;
  handleToroFocus: () => void;
  isFrozen: boolean;
}

const ToroPanel = ({
  cooperation,
  isToroInspired,
  handleToroHint,
  focusUsed,
  handleToroFocus,
  isFrozen,
}: ToroPanelProps): JSX.Element => (
  <View
    style={[
      styles.overlayCardSubtle,
      styles.challengeToroPanel,
      isToroInspired ? styles.challengeInspiredPanel : null,
    ]}
  >
    <View style={styles.challengeToroHeader}>
      <Text style={styles.challengeToroEmoji}>🐂</Text>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.challengeToroTitle}>Toro Cooperation</Text>
        <ProgressBar
          progress={cooperation / 100}
          color={colors.gold}
          style={styles.challengeCoopBar}
        />
      </View>
    </View>

    <View style={styles.challengeToroActions}>
      <TouchableOpacity
        style={[
          styles.challengeToroBtn,
          cooperation < 100 ? styles.challengeToroBtnDisabled : null,
        ]}
        disabled={cooperation < 100}
        onPress={handleToroHint}
      >
        <Ionicons name="bulb-outline" size={16} color={colors.white} />
        <Text style={styles.challengeToroBtnText}>Toro Hint</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.challengeToroBtn,
          focusUsed ? styles.challengeToroBtnDisabled : null,
        ]}
        disabled={focusUsed}
        onPress={handleToroFocus}
      >
        <Ionicons
          name={isFrozen ? "snow" : "hourglass-outline"}
          size={16}
          color={colors.white}
        />
        <Text style={styles.challengeToroBtnText}>
          {isFrozen ? "Frozen (3s)" : "Toro Focus"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ChallengeGameScreen = (): JSX.Element => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigation = useNavigation<ChallengeScreenNavigationProps>();
  const challenge = route.params;
  const dispatch = useDispatch();

  const minigameItem = minigames.find((item) => item.id === challenge.minigame);
  const MinigameComponent = minigameItem ? minigameItem.component : null;

  const {
    timeLeft,
    setTimeLeft,
    streak,
    cooperation,
    comboText,
    burstKey,
    focusUsed,
    isFrozen,
    handleToroHint,
    handleToroFocus,
    handleAnswerSubmit,
    handleIndexChange,
  } = useChallengeState(challenge);

  // Time counting effect
  useEffect(() => {
    if (timeLeft <= 0) {
      Alert.alert("Time's Up!", "You ran out of time!", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Home");
          },
        },
      ]);
      return () => {};
    }

    const interval = setInterval(() => {
      if (!isFrozen) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isFrozen, navigation, setTimeLeft]);

  // Combine callbacks in challenge prop
  const enhancedChallenge = useMemo(() => {
    return {
      ...challenge,
      onAnswerSubmit: handleAnswerSubmit,
      onIndexChange: handleIndexChange,
    };
  }, [challenge, handleAnswerSubmit, handleIndexChange]);

  const handleChallengeSubmit = async (
    result: ChalengeResult,
  ): Promise<void> => {
    try {
      const operationId = toOperationId(challenge.operationId);
      if (!operationId) {
        throw new Error(`Unknown operationId: ${challenge.operationId}`);
      }
      const challengeIdStr = String(challenge.challengeId);
      const response = await challengeUpdateResult(
        operationId,
        challengeIdStr,
        {
          time: result.time,
          correctAnswers: result.correctAnswers,
          coins: result.coins,
          xp: result.xp,
          results: result.results.map((resItem) => ({
            values: resItem.exercise,
            userInput: String(resItem.userResult),
            result: Number(resItem.expectedResult),
            separator: resItem.exercise.separator || "",
          })),
        },
      );
      if (response && response.data) {
        dispatch(syncProgress(response.data));
      }
    } catch {
      dispatch(completeChalange(result));
    }
    navigation.navigate("ChallengeResult", result);
  };

  if (!MinigameComponent) {
    return (
      <Layout>
        <Text
          style={{
            color: colors.white,
            textAlign: "center",
            marginTop: spacing.giant,
          }}
        >
          Minigame component not found.
        </Text>
      </Layout>
    );
  }

  const isToroInspired = streak >= 3;

  return (
    <Layout>
      <ChallengeTopBar
        isFrozen={isFrozen}
        timeLeft={timeLeft}
        isToroInspired={isToroInspired}
      />

      {/* Toro Cooperation & Assist Panel */}
      <ToroPanel
        cooperation={cooperation}
        isToroInspired={isToroInspired}
        handleToroHint={handleToroHint}
        focusUsed={focusUsed}
        handleToroFocus={handleToroFocus}
        isFrozen={isFrozen}
      />

      {/* Combo Streak Meter */}
      <ComboMeter streak={streak} />

      {/* Real-time Streak Combo Text Overlay */}
      <ComboPopup comboText={comboText} />

      {/* Flowers/Coin Rain Burst on High Combos */}
      <ComboRewardBurst burstKey={burstKey} />

      {/* Core Minigame Layout */}
      <View style={styles.challengeGameContainer}>
        <MinigameComponent
          challenge={enhancedChallenge}
          submitResults={handleChallengeSubmit}
        />
      </View>
    </Layout>
  );
};

export default ChallengeGameScreen;
