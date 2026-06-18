import { Minigame, OperationId } from "@/_generated/model";
import knex from "@/knexWrapper";
import { OperationProgressRow, MinigameProgressRow, CosmeticRow, UserCosmeticRow } from "@/types/KnexDBType";

export const getMinigame = (value: string | null | undefined): Minigame | undefined => {
  if (value === "singleLine" || value === "dragAndDrop" || value === "crossNumbers" || value === "memory") {
    return value;
  }
  return undefined;
};

export const getOperationId = (value: string): OperationId => {
  if (
    value === "addition" ||
    value === "subtraction" ||
    value === "multiplication" ||
    value === "division" ||
    value === "gauntlet" ||
    value === "daily_challenge"
  ) {
    return value;
  }
  return "addition";
};

export const ensureOperationProgress = async (
  userId: string,
  progressRows: OperationProgressRow[]
): Promise<OperationProgressRow[]> => {
  const operationsList = ["addition", "subtraction", "multiplication", "division", "gauntlet", "daily_challenge"];
  const progressMap = new Map<string, OperationProgressRow>(
    progressRows.map((rowItem) => [rowItem.operation_id, rowItem])
  );

  for (const operationIdItem of operationsList) {
    if (!progressMap.has(operationIdItem)) {
      const [newOp] = await knex("operation_progress")
        .insert({
          user_id: userId,
          operation_id: operationIdItem,
          level: 1,
          xp: 0
        })
        .returning("*");
      if (newOp) {
        progressMap.set(operationIdItem, newOp);
      }
    }
  }
  return Array.from(progressMap.values());
};

export const ensureMinigameProgress = async (
  userId: string,
  minigameProgressRows: MinigameProgressRow[]
): Promise<MinigameProgressRow[]> => {
  const minigamesList: Minigame[] = ["singleLine", "dragAndDrop", "crossNumbers", "memory"];
  const minigameProgressMap = new Map<Minigame, MinigameProgressRow>();
  minigameProgressRows.forEach((rowItem) => {
    const minigameId = getMinigame(rowItem.minigame_id);
    if (minigameId) {
      minigameProgressMap.set(minigameId, rowItem);
    }
  });

  for (const minigameIdItem of minigamesList) {
    if (!minigameProgressMap.has(minigameIdItem)) {
      const [newMg] = await knex("minigame_progress")
        .insert({
          user_id: userId,
          minigame_id: minigameIdItem,
          level: 1,
          xp: 0
        })
        .returning("*");
      if (newMg) {
        minigameProgressMap.set(minigameIdItem, newMg);
      }
    }
  }

  return Array.from(minigameProgressMap.values());
};

export interface CosmeticsLoadout {
  purchasedCosmetics: string[];
  equippedCape: string | null;
  equippedSuit: string | null;
  equippedFlare: string | null;
  coinsBalance: number;
}

export const getCosmeticsLoadout = async (userId: string, totalCoins: number): Promise<CosmeticsLoadout> => {
  const userCosmetics: UserCosmeticRow[] = await knex("user_cosmetics").where("user_id", userId);
  const purchasedCosmetics = userCosmetics.map((cosmeticItem) => cosmeticItem.cosmetic_id);

  const equippedCape =
    userCosmetics.find((cosmeticItem) => cosmeticItem.equipped && cosmeticItem.cosmetic_type === "cape")?.cosmetic_id ||
    null;
  const equippedSuit =
    userCosmetics.find((cosmeticItem) => cosmeticItem.equipped && cosmeticItem.cosmetic_type === "suit")?.cosmetic_id ||
    null;
  const equippedFlare =
    userCosmetics.find((cosmeticItem) => cosmeticItem.equipped && cosmeticItem.cosmetic_type === "flare")
      ?.cosmetic_id || null;

  let spentCoins = 0;
  if (purchasedCosmetics.length > 0) {
    const cosmeticsList: CosmeticRow[] = await knex("cosmetics").whereIn("id", purchasedCosmetics);
    spentCoins = cosmeticsList.reduce((accumulatedSum, cosmeticItem) => accumulatedSum + cosmeticItem.price, 0);
  }
  const coinsBalance = Math.max(0, totalCoins - spentCoins);

  return {
    purchasedCosmetics,
    equippedCape,
    equippedSuit,
    equippedFlare,
    coinsBalance
  };
};
