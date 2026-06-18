/* eslint-disable max-lines */
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { useState, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";

import Layout from "@/components/common/Layout";
import ThemedText from "@/components/texts/ThemedText";
import { RootState } from "@/redux/store";
import { challengeStartNew } from "@/src/_generated/api";
import { Challenge as ApiChallenge } from "@/src/_generated/model";
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
  mode: string,
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

const renderHeader = (
  navigation: GauntletScreenNavigationProp,
): JSX.Element => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
    <ThemedText variant="title" style={styles.title}>
      Coliseo de los Números
    </ThemedText>
    <View style={{ width: 40 }} />
  </View>
);

const renderLoadout = (user: RootState["user"]): JSX.Element => (
  <View style={styles.glassPanel}>
    <Text style={styles.sectionTitle}>
      <Ionicons name="shirt-outline" size={18} /> Equipped Loadout
    </Text>
    <View style={styles.loadoutGrid}>
      <View style={styles.loadoutItem}>
        <Text style={styles.loadoutLabel}>Cape</Text>
        <Text
          style={[
            styles.loadoutValue,
            user.equippedCape ? styles.activeCosmetic : null,
          ]}
        >
          {user.equippedCape ? "⚡ Cape Active" : "None"}
        </Text>
      </View>
      <View style={styles.loadoutItem}>
        <Text style={styles.loadoutLabel}>Suit</Text>
        <Text
          style={[
            styles.loadoutValue,
            user.equippedSuit ? styles.activeCosmetic : null,
          ]}
        >
          {user.equippedSuit ? "🔥 Suit Active" : "None"}
        </Text>
      </View>
      <View style={styles.loadoutItem}>
        <Text style={styles.loadoutLabel}>Flare</Text>
        <Text
          style={[
            styles.loadoutValue,
            user.equippedFlare ? styles.activeCosmetic : null,
          ]}
        >
          {user.equippedFlare ? "✨ Flare Active" : "None"}
        </Text>
      </View>
    </View>
  </View>
);

interface CardProps {
  startingMode: string | null;
  onPress: () => void;
}

const ArenaCard = ({ startingMode, onPress }: CardProps): JSX.Element => (
  <View style={styles.glassPanel}>
    <View style={styles.modeHeader}>
      <View>
        <Text style={styles.modeTitle}>La Gran Corrida</Text>
        <Text style={styles.modeSubtitle}>Endless mixed math sprint</Text>
      </View>
      <Ionicons name="flash-outline" size={32} color="#FFD700" />
    </View>
    <Text style={styles.rulesText}>
      ⏱️ 45 Seconds | ❌ 2 Allowed Mistakes | 🏆 High Rewards
    </Text>
    <TouchableOpacity
      style={[styles.startButton, startingMode ? styles.btnDisabled : null]}
      disabled={startingMode !== null}
      onPress={onPress}
    >
      {startingMode === "gauntlet" ? (
        <ActivityIndicator color="#1a1a1a" />
      ) : (
        <Text style={styles.startButtonText}>ENTER ARENA (GAUNTLET)</Text>
      )}
    </TouchableOpacity>
  </View>
);

const DailyCard = ({ startingMode, onPress }: CardProps): JSX.Element => (
  <View style={styles.glassPanel}>
    <View style={styles.modeHeader}>
      <View>
        <Text style={styles.modeTitle}>Corrida Diaria</Text>
        <Text style={styles.modeSubtitle}>
          Every player gets the same equations
        </Text>
      </View>
      <Ionicons name="calendar-outline" size={32} color="#E6007A" />
    </View>
    <Text style={styles.rulesText}>
      ⏱️ 90 Seconds | 💀 1 Life (0 Mistakes) | 🪙 50 Completion Reward + 5%
      Cosmetic Drop
    </Text>
    <TouchableOpacity
      style={[
        styles.startButton,
        { backgroundColor: "#E6007A" },
        startingMode ? styles.btnDisabled : null,
      ]}
      disabled={startingMode !== null}
      onPress={onPress}
    >
      {startingMode === "daily_challenge" ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.startButtonText, { color: "#fff" }]}>
          START DAILY CHALLENGE
        </Text>
      )}
    </TouchableOpacity>
  </View>
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
      {renderHeader(navigation)}

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
        <View style={styles.glassPanel}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="trophy-outline" size={18} /> Arena Leaderboard
          </Text>
          <View style={styles.leaderboardRow}>
            <Text style={styles.rank}>🥇</Text>
            <Text style={styles.player}>Matador El Primo</Text>
            <Text style={styles.score}>Wave 45</Text>
          </View>
          <View style={styles.leaderboardRow}>
            <Text style={styles.rank}>🥈</Text>
            <Text style={styles.player}>Senor Algebra</Text>
            <Text style={styles.score}>Wave 42</Text>
          </View>
          <View style={styles.leaderboardRow}>
            <Text style={styles.rank}>🥉</Text>
            <Text style={styles.player}>Toro Loco</Text>
            <Text style={styles.score}>Wave 39</Text>
          </View>
          <View style={[styles.leaderboardRow, styles.myRow]}>
            <Text style={styles.rank}>12</Text>
            <Text style={styles.player}>You</Text>
            <Text style={styles.score}>Wave 12</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    width: "100%",
  },
  backBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  glassPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  loadoutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadoutItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  loadoutLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  loadoutValue: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeCosmetic: {
    color: "#FFD700",
  },
  modeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modeTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modeSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 2,
  },
  rulesText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginVertical: 10,
  },
  startButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  startButtonText: {
    color: "#1a1a1a",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  rank: {
    width: 30,
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  player: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  score: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  myRow: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
  },
});

export default GauntletScreen;
