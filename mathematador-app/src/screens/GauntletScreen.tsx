/* eslint-disable max-lines */
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { useState, JSX } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";

import Card from "@/components/common/Card";
import Layout from "@/components/common/Layout";
import ScreenHeader from "@/components/common/ScreenHeader";
import { RootState } from "@/redux/store";
import { challengeStartNew } from "@/src/_generated/api";
import { Challenge as ApiChallenge } from "@/src/_generated/model";
import { colors, styles } from "@/theme";
import { Challenge as LocalChallenge, Exercise } from "@/types/Chalenge";
import { RootStackParamList } from "@/types/Navigation";

type GauntletScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Gauntlet"
>;

const generateOfflineExercises = (
  mode: "gauntlet" | "daily_challenge",
): Exercise[] => {
  const isGauntlet = mode === "gauntlet";
  const length = isGauntlet ? 10 : 20;
  const maxVal = isGauntlet ? 20 : 30;
  const baseVal = isGauntlet ? 5 : 10;

  return Array.from({ length }, () => {
    const operationSymbol = Math.random() > 0.5 ? "+" : "-";
    const val1 = Math.floor(Math.random() * maxVal) + baseVal;
    const val2 = Math.floor(Math.random() * val1) + 1;
    const result = operationSymbol === "+" ? val1 + val2 : val1 - val2;
    const exerciseItem: Exercise = [val1, val2];
    exerciseItem.separator = operationSymbol;
    exerciseItem.result = result;
    return exerciseItem;
  });
};

const createLocalChallenge = (
  serverChallenge: ApiChallenge,
  localExercises: Exercise[],
  userLevel: number,
  mode: "gauntlet" | "daily_challenge",
): LocalChallenge => {
  return {
    challengeId: serverChallenge.id ? 12345 : Math.floor(Math.random() * 1000),
    challengeOrderId: 1,
    exercises: localExercises,
    maxTime: serverChallenge.maxTime || 60,
    experiencePoints: serverChallenge.xpOnSuccess || 20,
    coinsOnSuccess: serverChallenge.coinsOnSuccess || 10,
    coinsOnFailure: serverChallenge.coinsOnFailure || 2,
    operationId: mode,
    level: userLevel,
    minigame: serverChallenge.minigame || "singleLine",
  };
};

const createOfflineChallenge = (
  mode: "gauntlet" | "daily_challenge",
  localExercises: Exercise[],
  userLevel: number,
): LocalChallenge => {
  const isGauntlet = mode === "gauntlet";
  return {
    challengeId: Math.floor(Math.random() * 10000),
    challengeOrderId: 1,
    exercises: localExercises,
    maxTime: isGauntlet ? 45 : 90,
    experiencePoints: isGauntlet ? 35 : 40,
    coinsOnSuccess: isGauntlet ? 25 : 50,
    coinsOnFailure: isGauntlet ? 5 : 10,
    operationId: mode,
    level: userLevel,
    minigame: "singleLine",
  };
};

const renderLoadout = (user: RootState["user"]): JSX.Element => (
  <Card style={styles.gauntletGlassPanel}>
    <Text style={styles.gauntletSectionTitle}>
      <Ionicons name="shirt-outline" size={18} /> Equipped Loadout
    </Text>
    <View style={styles.gauntletLoadoutGrid}>
      <View style={styles.gauntletLoadoutItem}>
        <Text style={styles.gauntletLoadoutLabel}>Cape</Text>
        <Text
          style={[
            styles.gauntletLoadoutValue,
            user.equippedCape ? styles.gauntletActiveCosmetic : null,
          ]}
        >
          {user.equippedCape ? "⚡ Cape Active" : "None"}
        </Text>
      </View>
      <View style={styles.gauntletLoadoutItem}>
        <Text style={styles.gauntletLoadoutLabel}>Suit</Text>
        <Text
          style={[
            styles.gauntletLoadoutValue,
            user.equippedSuit ? styles.gauntletActiveCosmetic : null,
          ]}
        >
          {user.equippedSuit ? "🔥 Suit Active" : "None"}
        </Text>
      </View>
      <View style={styles.gauntletLoadoutItem}>
        <Text style={styles.gauntletLoadoutLabel}>Flare</Text>
        <Text
          style={[
            styles.gauntletLoadoutValue,
            user.equippedFlare ? styles.gauntletActiveCosmetic : null,
          ]}
        >
          {user.equippedFlare ? "✨ Flare Active" : "None"}
        </Text>
      </View>
    </View>
  </Card>
);

interface CardProps {
  startingMode: string | null;
  onPress: () => void;
}

const ArenaCard = ({ startingMode, onPress }: CardProps): JSX.Element => (
  <Card style={styles.gauntletGlassPanel}>
    <View style={styles.gauntletModeHeader}>
      <View>
        <Text style={styles.gauntletModeTitle}>La Gran Corrida</Text>
        <Text style={styles.gauntletModeSubtitle}>
          Endless mixed math sprint
        </Text>
      </View>
      <Ionicons name="flash-outline" size={32} color={colors.gold} />
    </View>
    <Text style={styles.gauntletRulesText}>
      ⏱️ 45 Seconds | ❌ 2 Allowed Mistakes | 🏆 High Rewards
    </Text>
    <TouchableOpacity
      style={[
        styles.gauntletStartButton,
        startingMode ? styles.gauntletBtnDisabled : null,
      ]}
      disabled={startingMode !== null}
      onPress={onPress}
    >
      {startingMode === "gauntlet" ? (
        <ActivityIndicator color={colors.nearBlack} />
      ) : (
        <Text style={styles.gauntletStartButtonText}>
          ENTER ARENA (GAUNTLET)
        </Text>
      )}
    </TouchableOpacity>
  </Card>
);

const DailyCard = ({ startingMode, onPress }: CardProps): JSX.Element => (
  <Card style={styles.gauntletGlassPanel}>
    <View style={styles.gauntletModeHeader}>
      <View>
        <Text style={styles.gauntletModeTitle}>Corrida Diaria</Text>
        <Text style={styles.gauntletModeSubtitle}>
          Every player gets the same equations
        </Text>
      </View>
      <Ionicons name="calendar-outline" size={32} color={colors.magenta} />
    </View>
    <Text style={styles.gauntletRulesText}>
      ⏱️ 90 Seconds | 💀 1 Life (0 Mistakes) | 🪙 50 Completion Reward + 5%
      Cosmetic Drop
    </Text>
    <TouchableOpacity
      style={[
        styles.gauntletStartButton,
        { backgroundColor: colors.magenta },
        startingMode ? styles.gauntletBtnDisabled : null,
      ]}
      disabled={startingMode !== null}
      onPress={onPress}
    >
      {startingMode === "daily_challenge" ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.gauntletStartButtonText, { color: colors.white }]}>
          START DAILY CHALLENGE
        </Text>
      )}
    </TouchableOpacity>
  </Card>
);

const GauntletScreen = (): JSX.Element => {
  const navigation = useNavigation<GauntletScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user);

  const [startingMode, setStartingMode] = useState<string | null>(null);

  const handleStart = async (
    mode: "gauntlet" | "daily_challenge",
  ): Promise<void> => {
    try {
      setStartingMode(mode);
      const apiResponse = await challengeStartNew(mode, {
        operationId: mode,
        minigame: "singleLine",
      });

      const serverChallenge = apiResponse.data;
      if (!serverChallenge || !serverChallenge.exercises) {
        throw new Error("Invalid challenge returned");
      }

      // Map server-generated exercises to frontend format
      const localExercises = (serverChallenge.exercises || []).map(
        (exerciseItem: {
          values?: number[];
          separator?: string;
          result?: number;
        }) => {
          const mappedItem: Exercise = [...(exerciseItem.values || [])];
          mappedItem.separator = exerciseItem.separator;
          mappedItem.result = exerciseItem.result;
          return mappedItem;
        },
      );

      const localChallenge = createLocalChallenge(
        serverChallenge,
        localExercises,
        user.level,
        mode,
      );

      navigation.navigate("Challenge", localChallenge);
    } catch {
      // Fallback offline generation
      const localExercises = generateOfflineExercises(mode);

      const localChallenge = createOfflineChallenge(
        mode,
        localExercises,
        user.level,
      );

      navigation.navigate("Challenge", localChallenge);
    } finally {
      setStartingMode(null);
    }
  };

  return (
    <Layout>
      <ScreenHeader
        title="Coliseo de los Números"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderLoadout(user)}

        <ArenaCard
          startingMode={startingMode}
          onPress={() => handleStart("gauntlet")}
        />

        <DailyCard
          startingMode={startingMode}
          onPress={() => handleStart("daily_challenge")}
        />

        {/* Leaderboard panel */}
        <Card style={styles.gauntletGlassPanel}>
          <Text style={styles.gauntletSectionTitle}>
            <Ionicons name="trophy-outline" size={18} /> Arena Leaderboard
          </Text>
          <View style={styles.gauntletLeaderboardRow}>
            <Text style={styles.gauntletRank}>🥇</Text>
            <Text style={styles.gauntletPlayer}>Matador El Primo</Text>
            <Text style={styles.gauntletScore}>Wave 45</Text>
          </View>
          <View style={styles.gauntletLeaderboardRow}>
            <Text style={styles.gauntletRank}>🥈</Text>
            <Text style={styles.gauntletPlayer}>Senor Algebra</Text>
            <Text style={styles.gauntletScore}>Wave 42</Text>
          </View>
          <View style={styles.gauntletLeaderboardRow}>
            <Text style={styles.gauntletRank}>🥉</Text>
            <Text style={styles.gauntletPlayer}>Toro Loco</Text>
            <Text style={styles.gauntletScore}>Wave 39</Text>
          </View>
          <View style={[styles.gauntletLeaderboardRow, styles.gauntletMyRow]}>
            <Text style={styles.gauntletRank}>12</Text>
            <Text style={styles.gauntletPlayer}>You</Text>
            <Text style={styles.gauntletScore}>Wave 12</Text>
          </View>
        </Card>
      </ScrollView>
    </Layout>
  );
};

export default GauntletScreen;
