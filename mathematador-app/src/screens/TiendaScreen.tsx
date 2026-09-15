/* eslint-disable max-lines */
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { useNavigation } from "expo-router/react-navigation";
import { useEffect, JSX, useState } from "react";
import {
  View,
  Text,
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
import { colors, styles } from "@/theme";
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
    return { icon: "shield-outline", color: colors.magenta };
  }
  if (type === "flare") {
    return { icon: "sparkles-outline", color: colors.cyan };
  }
  return { icon: "shirt-outline", color: colors.gold };
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
      return styles.tiendaBtnDisabled;
    }
    if (isOwned) {
      return isEquipped ? styles.tiendaBtnEquipped : styles.tiendaBtnEquip;
    }
    return styles.tiendaBtnBuy;
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
        styles.overlayCardSubtle,
        styles.cardDropShadow,
        styles.tiendaCard,
        isEquipped && styles.tiendaCardEquipped,
        isLocked && styles.tiendaCardLocked,
      ]}
    >
      <View style={styles.tiendaCardHeader}>
        <View style={[styles.tiendaIconContainer, { borderColor: iconColor }]}>
          <Ionicons name={itemIcon} size={32} color={iconColor} />
        </View>
        <View style={styles.tiendaCardInfo}>
          <Text style={styles.tiendaCardTitle}>{item.name}</Text>
          {isLocked ? (
            <Text style={styles.tiendaLockText}>
              <Ionicons name="lock-closed" size={12} /> Lvl {item.requiredLevel}{" "}
              Required
            </Text>
          ) : (
            <Text style={styles.tiendaUnlockedText}>
              <Ionicons name="checkmark-circle-outline" size={12} /> Level{" "}
              {item.requiredLevel}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.tiendaCardFooter}>
        {!isOwned && (
          <View style={styles.tiendaPriceContainer}>
            <Text style={styles.tiendaCoinSymbol}>🪙</Text>
            <Text style={styles.tiendaPriceText}>{item.price}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.tiendaActionButton, getButtonStyle()]}
          disabled={
            isLocked || (user.coins < item.price && !isOwned) || isActionLoading
          }
          onPress={() =>
            isOwned ? onEquipToggle(item, isEquipped) : onBuy(item)
          }
        >
          {isActionLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.tiendaBtnText}>{getButtonText()}</Text>
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
      <ActivityIndicator
        size="large"
        color={colors.gold}
        style={styles.tiendaLoader}
      />
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Text style={styles.tiendaEmptyText}>
        No items available in this category.
      </Text>
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
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <ThemedText variant="title" style={styles.tiendaTitle}>
          Tienda de Torero
        </ThemedText>
        <View style={styles.tiendaCoinsWrapper}>
          <Text style={styles.tiendaCoinsEmoji}>🪙</Text>
          <Text style={styles.tiendaCoinsCount}>{user.coins}</Text>
        </View>
      </View>

      {/* Categories Tabs */}
      <View style={[styles.overlayCardSubtle, styles.tiendaTabBar]}>
        {COSMETIC_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tiendaTab,
              activeTab === category && styles.tiendaTabActive,
            ]}
            onPress={() => setActiveTab(category)}
          >
            <Text
              style={[
                styles.tiendaTabText,
                activeTab === category && styles.tiendaTabTextActive,
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

export default TiendaScreen;
