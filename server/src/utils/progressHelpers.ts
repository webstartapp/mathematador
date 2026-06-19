import { Minigame, OperationId } from "@/_generated/model";
import knex from "@/knexWrapper";
import { OperationProgressRow, MinigameProgressRow, CosmeticRow, UserCosmeticRow } from "@/types/KnexDBType";

export const getMinigame = (value: string | null | undefined): Minigame | undefined => {
  const minigames: Minigame[] = ["singleLine", "dragAndDrop", "crossNumbers", "memory"];
  return minigames.find((minigameItem) => minigameItem === value);
};

export const getOperationId = (value: string): OperationId => {
  const operations: OperationId[] = [
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "gauntlet",
    "daily_challenge"
  ];
  return operations.find((operationItem) => operationItem === value) || "addition";
};

export const ensureOperationProgress = async (
  userId: string,
  progressRows: OperationProgressRow[]
): Promise<OperationProgressRow[]> => {
  const operationsList = ["addition", "subtraction", "multiplication", "division", "gauntlet", "daily_challenge"];
  const progressMap = new Map<string, OperationProgressRow>();
  progressRows.forEach((rowItem) => {
    progressMap.set(rowItem.operation_id, rowItem);
  });

  for (const operationIdItem of operationsList) {
    if (!progressMap.has(operationIdItem)) {
      const [newOp] = await knex("operation_progress")
        .insert({ user_id: userId, operation_id: operationIdItem, level: 1, xp: 0 })
        .returning("*");
      if (newOp) progressMap.set(operationIdItem, newOp);
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
    if (minigameId) minigameProgressMap.set(minigameId, rowItem);
  });

  for (const minigameIdItem of minigamesList) {
    if (!minigameProgressMap.has(minigameIdItem)) {
      const [newMg] = await knex("minigame_progress")
        .insert({ user_id: userId, minigame_id: minigameIdItem, level: 1, xp: 0 })
        .returning("*");
      if (newMg) minigameProgressMap.set(minigameIdItem, newMg);
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

  const findEquipped = (type: string): string | null =>
    userCosmetics.find((cosmeticItem) => cosmeticItem.equipped && cosmeticItem.cosmetic_type === type)?.cosmetic_id ||
    null;
  const equippedCape = findEquipped("cape");
  const equippedSuit = findEquipped("suit");
  const equippedFlare = findEquipped("flare");

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

export const updateProgress = async (
  table: "operation_progress" | "minigame_progress",
  whereClause: Record<string, string>,
  insertData: Record<string, number>,
  xpAwarded: number
): Promise<void> => {
  let record = await knex(table).where(whereClause).first();

  if (!record) {
    const [newRecord] = await knex(table)
      .insert({ ...whereClause, ...insertData })
      .returning("*");
    record = newRecord;
  }

  if (!record) {
    return;
  }

  let currentXp = record.xp + xpAwarded;
  let currentLevel = record.level;

  while (currentXp >= currentLevel * 100) {
    currentXp -= currentLevel * 100;
    currentLevel += 1;
  }

  await knex(table).where({ id: record.id }).update({
    xp: currentXp,
    level: currentLevel
  });
};

export const handleCosmeticDrop = async (userId: string, operationId: string, isSuccess: boolean): Promise<void> => {
  if (operationId !== "daily_challenge" || !isSuccess) {
    return;
  }

  if (Math.random() < 0.05) {
    const allCosmetics = await knex("cosmetics").select("*");
    const ownedCosmetics = await knex("user_cosmetics").where("user_id", userId).select("cosmetic_id");
    const ownedIds = new Set(ownedCosmetics.map((row) => row.cosmetic_id));

    const unowned = allCosmetics.filter((cosmeticItem) => !ownedIds.has(cosmeticItem.id));
    if (unowned.length > 0) {
      const luckyCosmetic = unowned[Math.floor(Math.random() * unowned.length)];
      await knex("user_cosmetics").insert({
        user_id: userId,
        cosmetic_id: luckyCosmetic.id,
        cosmetic_type: luckyCosmetic.type,
        equipped: false
      });
    }
  }
};
