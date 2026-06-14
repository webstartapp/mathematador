/* eslint-disable max-lines, @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
// components/common/GameHeader.tsx
import Icon from "@expo/vector-icons/FontAwesome";
import {
  StackHeaderProps,
  StackNavigationProp,
} from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { useEffect, useMemo, useRef, FC, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  findNodeHandle,
} from "react-native";
import { ProgressBar } from "react-native-paper"; // Example of a simple progress bar component
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/redux/store";
import { calculateXPToNextLevel } from "@/src/helpers/calculateXPToNextLevel";
import { setHeaderRef } from "@/src/hooks/RefManager";
import { levelOperationUp, levelUserUp } from "@/src/redux/slices/userSlice";
import { RootStackParamList } from "@/types/Navigation";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type HeaderProps = {
  backTo?: keyof RootStackParamList;
  showOperation?: boolean;
  props: StackHeaderProps;
};
const { HeaderModule } = NativeModules;

const eventEmitter = new NativeEventEmitter(HeaderModule);

export const HeaderEvents = {
  onHeaderHeightChange: (callback: (height: number) => void) => {
    const subscription = eventEmitter.addListener(
      "headerHeightChange",
      callback,
    );
    return () => {
      subscription.remove();
    };
  },
  emitHeaderHeightChange: (height: number) => {
    eventEmitter.emit("headerHeightChange", height);
  },
};

const GameHeader: FC<HeaderProps> = ({
  backTo,
  showOperation: _showOperation,
  props,
}): JSX.Element => {
  const headerRef = useRef<View>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setHeaderRef(headerRef.current); // Set the header reference
    const handleMeasurement = (): void => {
      const node = findNodeHandle(headerRef.current);
      if (node) {
        // Measure the header
        headerRef.current?.measure((offsetX, offsetY, _width, height) => {
          HeaderEvents.emitHeaderHeightChange(height);
        });
      }
    };

    handleMeasurement();
  }, []);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const { backToParams } = useSelector((state: RootState) => state.navigation);

  // Accessing user stats from Redux
  const { level, xp, xpToNextLevel, operationProgress } = useSelector(
    (state: RootState) => state.user,
  );

  const operationIdParam = (props.route.params as any)?.operationId;

  const userStats = useMemo(() => {
    if (!operationIdParam) {
      return { level, xp, xpToNextLevel };
    }
    const operationItem = operationProgress.find(
      (opItem) => opItem.operationId === operationIdParam,
    );
    const itemXp = operationItem?.xp ?? 0;
    const itemXpToNext = operationItem?.xpToNextLevel ?? 1;
    const fallbackXpToNext =
      operationItem?.xpToNextLevel ?? calculateXPToNextLevel(1);
    return {
      level: operationItem?.level,
      xp: itemXp,
      xpToNextLevel: itemXpToNext,
      xpProgress: itemXp / fallbackXpToNext,
    };
  }, [level, xp, xpToNextLevel, operationProgress, operationIdParam]);

  // Calculate XP progress percentage
  const xpProgress = xp / xpToNextLevel;

  return (
    <View style={styles.headerContainer} ref={headerRef}>
      {backTo && (
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate(backTo, backToParams as any)}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.statsContainer}>
        <Text style={styles.level}>
          {(props.route.params as any)?.operationId ? "Dificulty:" : "Level:"}{" "}
          {userStats.level}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              if ((props.route.params as any)?.operationId) {
                dispatch(
                  levelOperationUp((props.route.params as any)?.operationId),
                );
                return;
              }
              dispatch(levelUserUp());
            }}
            style={{ flexDirection: "row" }}
          >
            <Icon name="trophy" size={24} color="#ffbb64" />
            <Text style={{ marginRight: 10, color: "#ffbb64" }}>+1</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ProgressBar
              progress={xpProgress}
              color="#ffbb64"
              style={styles.progressBar}
            />
          </View>
        </View>
        <Text style={styles.xpText}>
          {userStats.xp}/{userStats.xpToNextLevel} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  level: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 5,
  },
  xpText: {
    fontSize: 12,
    color: "#666",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 60,
  },
});

export default GameHeader;
