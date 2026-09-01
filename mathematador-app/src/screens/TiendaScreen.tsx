/* eslint-disable max-lines */
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { useEffect, JSX, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Layout from "@/components/common/Layout";
import ThemedText from "@/components/texts/ThemedText";
import {
  buyCosmetic,
  equipCosmetic,
  syncProgress,
} from "@/redux/slices/userSlice";
import type { UserState } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import {
  cosmeticsGetAll,
  cosmeticsBuy,
  cosmeticsEquip,
} from "@/src/_generated/api";
import { Cosmetic, CosmeticType } from "@/src/_generated/model";
import { RootStackParamList } from "@/types/Navigation";

type CosmeticItem = {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
  assetId: string;
  requiredLevel: number;
};

const FALLBACK_COSMETICS: CosmeticItem[] = [
  {
    id: "cape_fibonacci",
    name: "Fibonacci Spiral Cape",
    type: "cape",
    price: 100,
    assetId: "cape_fibonacci",
    requiredLevel: 1,
  },
  {
    id: "cape_pi",
    name: "Golden Pi Cape",
    type: "cape",
    price: 300,
    assetId: "cape_pi",
    requiredLevel: 3,
  },
  {
    id: "suit_matrix",
    name: "Matrix Code Suit",
    type: "suit",
    price: 200,
    assetId: "suit_matrix",
    requiredLevel: 2,
  },
  {
    id: "suit_neon",
    name: "Neon Sparkle Suit",
    type: "suit",
    price: 500,
    assetId: "suit_neon",
    requiredLevel: 4,
  },
  {
    id: "flare_golden",
    name: "Golden Flare",
    type: "flare",
    price: 150,
    assetId: "flare_golden",
    requiredLevel: 1,
  },
  {
    id: "flare_firework",
    name: "Sparkling Firework Flare",
    type: "flare",
    price: 350,
    assetId: "flare_firework",
    requiredLevel: 3,
  },
];

const COSMETIC_CATEGORIES: CosmeticType[] = ["cape", "suit", "flare"];

const getCardStatus = (
  item: CosmeticItem,
  user: UserState,
  actionLoadingId: string | null,
): {
  isOwned: boolean;
  isEquipped: boolean;
  isLocked: boolean;
  isActionLoading: boolean;
} => {
  const isOwned = user.purchasedCosmetics.includes(item.id);
  const isEquipped =
    (item.type === "cape" && user.equippedCape === item.id) ||
    (item.type === "suit" && user.equippedSuit === item.id) ||
    (item.type === "flare" && user.equippedFlare === item.id);

  const isLocked = user.level < item.requiredLevel;
  const isActionLoading = actionLoadingId === item.id;

  return { isOwned, isEquipped, isLocked, isActionLoading };
};

const getCosmeticIconInfo = (
  type: CosmeticType,
): {
  icon: "shield-outline" | "sparkles-outline" | "shirt-outline";
  color: string;
} => {
  if (type === "cape") {
    return { icon: "shield-outline", color: "#E6007A" };
  }
  if (type === "flare") {
    return { icon: "sparkles-outline", color: "#00FFFF" };
  }
  return { icon: "shirt-outline", color: "#FFD700" };
};

interface CosmeticCardProps {
  item: CosmeticItem;
  user: UserState;
  actionLoadingId: string | null;
  onEquipToggle: (item: CosmeticItem, isEquipped: boolean) => Promise<void>;
  onBuy: (item: CosmeticItem) => Promise<void>;
}

const CosmeticCard = ({
  item,
  user,
  actionLoadingId,
  onEquipToggle,
  onBuy,
}: CosmeticCardProps): JSX.Element => {
  const { isOwned, isEquipped, isLocked, isActionLoading } = getCardStatus(
    item,
    user,
    actionLoadingId,
  );
  const { icon: itemIcon, color: iconColor } = getCosmeticIconInfo(item.type);

  const getButtonStyle = (): object => {
    if (isLocked || (user.coins < item.price && !isOwned)) {
      return styles.btnDisabled;
    }
    if (isOwned) {
      return isEquipped ? styles.btnEquipped : styles.btnEquip;
    }
    return styles.btnBuy;
  };

  const getButtonText = (): string => {
    if (isOwned) {
      return isEquipped ? "Equipped" : "Equip";
    }
    return "Buy";
  };

  return (
    <View
      style={[
        styles.card,
        isEquipped && styles.cardEquipped,
        isLocked && styles.cardLocked,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { borderColor: iconColor }]}>
          <Ionicons name={itemIcon} size={32} color={iconColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {isLocked ? (
            <Text style={styles.lockText}>
              <Ionicons name="lock-closed" size={12} /> Lvl {item.requiredLevel}{" "}
              Required
            </Text>
          ) : (
            <Text style={styles.unlockedText}>
              <Ionicons name="checkmark-circle-outline" size={12} /> Level{" "}
              {item.requiredLevel}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        {!isOwned && (
          <View style={styles.priceContainer}>
            <Text style={styles.coinSymbol}>🪙</Text>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, getButtonStyle()]}
          disabled={
            isLocked || (user.coins < item.price && !isOwned) || isActionLoading
          }
          onPress={() =>
            isOwned ? onEquipToggle(item, isEquipped) : onBuy(item)
          }
        >
          {isActionLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface RenderContentProps {
  loading: boolean;
  filteredItems: CosmeticItem[];
  user: UserState;
  actionLoadingId: string | null;
  onEquipToggle: (item: CosmeticItem, isEquipped: boolean) => Promise<void>;
  onBuy: (item: CosmeticItem) => Promise<void>;
}

const renderContent = ({
  loading,
  filteredItems,
  user,
  actionLoadingId,
  onEquipToggle,
  onBuy,
}: RenderContentProps): JSX.Element => {
  if (loading) {
    return (
      <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Text style={styles.emptyText}>No items available in this category.</Text>
    );
  }

  return (
    <>
      {filteredItems.map((cosmeticItem) => (
        <CosmeticCard
          key={cosmeticItem.id}
          item={cosmeticItem}
          user={user}
          actionLoadingId={actionLoadingId}
          onEquipToggle={onEquipToggle}
          onBuy={onBuy}
        />
      ))}
    </>
  );
};

type TiendaScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Tienda"
>;

const TiendaScreen = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigation = useNavigation<TiendaScreenNavigationProp>();
  const user: UserState = useSelector((state: RootState) => state.user);

  const [activeTab, setActiveTab] = useState<CosmeticType>("cape");
  const [cosmetics, setCosmetics] =
    useState<CosmeticItem[]>(FALLBACK_COSMETICS);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setLoadingId] = useState<string | null>(null);

  // Fetch cosmetics on load
  const loadCosmetics = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await cosmeticsGetAll();
      if (response && Array.isArray(response.data)) {
        const mapped = response.data.map(
          (cosmeticItem: Cosmetic): CosmeticItem => ({
            id: cosmeticItem.id ?? "",
            name: cosmeticItem.name ?? "",
            type: cosmeticItem.type ?? "cape",
            price: cosmeticItem.price ?? 0,
            assetId: cosmeticItem.assetId ?? "",
            requiredLevel: cosmeticItem.requiredLevel ?? 1,
          }),
        );
        setCosmetics(mapped);
      }
    } catch {
      // Quietly fall back to preset cosmetics if offline
      setCosmetics(FALLBACK_COSMETICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCosmetics();
  }, []);

  const handleBuy = async (item: CosmeticItem): Promise<void> => {
    if (user.level < item.requiredLevel) {
      Alert.alert(
        "Locked",
        `Requires level ${item.requiredLevel} to purchase.`,
      );
      return;
    }
    if (user.coins < item.price) {
      Alert.alert("Locked", "Insufficient coins.");
      return;
    }

    try {
      setLoadingId(item.id);
      const purchaseResponse = await cosmeticsBuy({ cosmeticId: item.id });
      if (purchaseResponse && purchaseResponse.data) {
        dispatch(syncProgress(purchaseResponse.data));
        Alert.alert("Success", `${item.name} purchased!`);
      }
    } catch {
      // Fallback offline purchase
      dispatch(buyCosmetic({ cosmeticId: item.id, price: item.price }));
      Alert.alert("Success", `${item.name} purchased offline!`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEquipToggle = async (
    item: CosmeticItem,
    isEquipped: boolean,
  ): Promise<void> => {
    try {
      setLoadingId(item.id);
      const equipResponse = await cosmeticsEquip({
        cosmeticId: item.id,
        equipped: !isEquipped,
      });
      if (equipResponse && equipResponse.data) {
        dispatch(syncProgress(equipResponse.data));
      }
    } catch {
      // Fallback offline equip
      dispatch(
        equipCosmetic({
          cosmeticId: item.id,
          type: item.type,
          equipped: !isEquipped,
        }),
      );
    } finally {
      setLoadingId(null);
    }
  };

  const filteredItems = cosmetics.filter(
    (cosmeticItem) => cosmeticItem.type === activeTab,
  );

  return (
    <Layout>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText variant="title" style={styles.title}>
          Tienda de Torero
        </ThemedText>
        <View style={styles.coinsWrapper}>
          <Text style={styles.coinsEmoji}>🪙</Text>
          <Text style={styles.coinsCount}>{user.coins}</Text>
        </View>
      </View>

      {/* Categories Tabs */}
      <View style={styles.tabBar}>
        {COSMETIC_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.tab, activeTab === category && styles.tabActive]}
            onPress={() => setActiveTab(category)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === category && styles.tabTextActive,
              ]}
            >
              {category.toUpperCase()}S
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderContent({
          loading,
          filteredItems,
          user,
          actionLoadingId,
          onEquipToggle: handleEquipToggle,
          onBuy: handleBuy,
        })}
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  coinsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1.5,
    borderColor: "#FFD700",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 5, color: "rgba(255,215,0,0.3)" },
    ],
  },
  coinsEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  coinsCount: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 21,
  },
  tabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 3,
        color: "rgba(255,255,255,0.1)",
      },
    ],
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 16,
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 10, color: "rgba(0,0,0,0.15)" },
    ],
  },
  cardEquipped: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    // Matches `card`'s offsetY:4 - previously this only overrode
    // shadowColor/Opacity/Radius and inherited card's shadowOffset since
    // boxShadow replaces the whole shadow as one style key, not four.
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 8, color: "rgba(255,215,0,0.1)" },
    ],
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lockText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  unlockedText: {
    color: "#4CD964",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinSymbol: {
    fontSize: 18,
    marginRight: 4,
  },
  priceText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  btnBuy: {
    backgroundColor: "#FFD700",
  },
  btnEquip: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  btnEquipped: {
    backgroundColor: "#4CD964",
  },
  btnDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  btnText: {
    color: "#1a1a1a",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default TiendaScreen;
