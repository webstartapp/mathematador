/* eslint-disable max-lines */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameProgress,
  MinigameProgress as ApiMinigameProgress,
  GameOperationProgress,
} from "@/src/_generated/model";
import { operations } from "@/src/configs/operations";
import { calculateXPToNextLevel } from "@/src/helpers/calculateXPToNextLevel";
import { getChallengeByLevel } from "@/src/helpers/getChalengeByLevel";
import { ChalengeResult, Challenge } from "@/src/types/Chalenge";

export type MinigameProgress = {
  minigameId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
};

type OperationProgress = {
  operationId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentChallengeId: number;
  currentChallenge: Challenge;
  completedChallenges: ChalengeResult[];
};

export interface UserState {
  name: string;
  level: number;
  xp: number;
  coins: number;
  xpToNextLevel: number;
  operationProgress: OperationProgress[];
  purchasedCosmetics: string[];
  equippedCape: string | null;
  equippedSuit: string | null;
  equippedFlare: string | null;
  minigameProgress: MinigameProgress[];
  musicEnabled: boolean;
}

const initialState: UserState = {
  name: "Corina",
  level: 1,
  xp: 0,
  coins: 0,
  musicEnabled: true,
  xpToNextLevel: calculateXPToNextLevel(1 * 2),
  operationProgress: operations.map((operation) => ({
    completedChallenges: [],
    currentChallengeId: 1,
    level: 1,
    operationId: operation.operationId,
    xp: 0,
    xpToNextLevel: calculateXPToNextLevel(1),
    currentChallenge: getChallengeByLevel(1, operation.operationId, 1),
  })),
  purchasedCosmetics: [],
  equippedCape: null,
  equippedSuit: null,
  equippedFlare: null,
  minigameProgress: [
    { minigameId: "singleLine", level: 1, xp: 0, xpToNextLevel: 100 },
    { minigameId: "dragAndDrop", level: 1, xp: 0, xpToNextLevel: 100 },
    { minigameId: "crossNumbers", level: 1, xp: 0, xpToNextLevel: 100 },
    { minigameId: "memory", level: 1, xp: 0, xpToNextLevel: 100 },
  ],
};

const syncOperations = (
  stateOperations: OperationProgress[],
  payloadOperations: GameOperationProgress[] | undefined,
): void => {
  if (!payloadOperations || !Array.isArray(payloadOperations)) {
    return;
  }
  payloadOperations.forEach((operationItem, progressIndex) => {
    const target = stateOperations[progressIndex];
    if (target) {
      target.level = operationItem.level ?? target.level;
      target.xp = operationItem.xp ?? target.xp;
    }
  });
};

const syncMinigames = (
  payloadMinigames: ApiMinigameProgress[] | undefined,
): MinigameProgress[] => {
  if (!payloadMinigames) {
    return [];
  }
  return payloadMinigames.map((minigameItem) => {
    const levelVal = minigameItem.level ?? 1;
    return {
      minigameId: minigameItem.minigameId,
      level: levelVal,
      xp: minigameItem.xp ?? 0,
      xpToNextLevel: calculateXPToNextLevel(levelVal),
    };
  });
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setMusicEnabled(state, action: PayloadAction<boolean>) {
      state.musicEnabled = action.payload;
    },
    levelUserUp(state) {
      state.level += 1;
      state.xp = state.xp - state.xpToNextLevel; // Reset XP
      state.xpToNextLevel = calculateXPToNextLevel(state.level); // Recalculate XP requirement
    },
    levelOperationUp(state, action: PayloadAction<string>) {
      const operationProgress = state.operationProgress.find(
        (operation) => operation.operationId === action.payload,
      );
      if (operationProgress) {
        operationProgress.level += 1;
        operationProgress.xp =
          operationProgress.xp - operationProgress.xpToNextLevel;
        operationProgress.xpToNextLevel = calculateXPToNextLevel(
          operationProgress.level,
        );
        operationProgress.currentChallenge = getChallengeByLevel(
          operationProgress.level,
          operationProgress.operationId,
          operationProgress.currentChallengeId,
        );
      }
    },
    completeChalange(state, action: PayloadAction<ChalengeResult>) {
      state.xp += action.payload.xp;
      state.coins += action.payload.coins;
      const operationProgress = state.operationProgress.find(
        (operation) => operation.operationId === action.payload.operationId,
      );
      if (
        operationProgress &&
        operationProgress.currentChallengeId === action.payload.challengeOrderId
      ) {
        const nextChallengeId = operationProgress.currentChallengeId + 1;
        operationProgress.xp += action.payload.xp;
        operationProgress.currentChallengeId = nextChallengeId;
        operationProgress.currentChallenge = getChallengeByLevel(
          operationProgress.level,
          operationProgress.operationId,
          nextChallengeId,
        );
        operationProgress.completedChallenges.push(action.payload);
      }
    },
    buyCosmetic(
      state,
      action: PayloadAction<{ cosmeticId: string; price: number }>,
    ) {
      if (state.coins >= action.payload.price) {
        state.coins -= action.payload.price;
        if (!state.purchasedCosmetics.includes(action.payload.cosmeticId)) {
          state.purchasedCosmetics.push(action.payload.cosmeticId);
        }
      }
    },
    equipCosmetic(
      state,
      action: PayloadAction<{
        cosmeticId: string;
        type: "cape" | "suit" | "flare";
        equipped: boolean;
      }>,
    ) {
      const { cosmeticId, type, equipped } = action.payload;
      if (type === "cape") {
        state.equippedCape = equipped ? cosmeticId : null;
      } else if (type === "suit") {
        state.equippedSuit = equipped ? cosmeticId : null;
      } else if (type === "flare") {
        state.equippedFlare = equipped ? cosmeticId : null;
      }
    },
    completeMinigame(
      state,
      action: PayloadAction<{ minigameId: string; xp: number; coins: number }>,
    ) {
      const { minigameId, xp, coins } = action.payload;
      state.xp += xp;
      state.coins += coins;
      const minigameProgress = state.minigameProgress.find(
        (minigameItem) => minigameItem.minigameId === minigameId,
      );
      if (minigameProgress) {
        minigameProgress.xp += xp;
        while (minigameProgress.xp >= minigameProgress.xpToNextLevel) {
          minigameProgress.xp -= minigameProgress.xpToNextLevel;
          minigameProgress.level += 1;
          minigameProgress.xpToNextLevel = calculateXPToNextLevel(
            minigameProgress.level,
          );
        }
      }
    },
    syncProgress(state, action: PayloadAction<GameProgress>) {
      const progressPayload = action.payload;
      state.level = progressPayload.level ?? state.level;
      state.xp = progressPayload.xp ?? state.xp;
      state.coins = progressPayload.coins ?? state.coins;
      state.purchasedCosmetics =
        progressPayload.purchasedCosmetics ?? state.purchasedCosmetics;
      state.equippedCape = progressPayload.equippedCape ?? null;
      state.equippedSuit = progressPayload.equippedSuit ?? null;
      state.equippedFlare = progressPayload.equippedFlare ?? null;
      if (progressPayload.minigameProgress) {
        state.minigameProgress = syncMinigames(
          progressPayload.minigameProgress,
        );
      }
      syncOperations(state.operationProgress, progressPayload.operations);
    },
  },
});

export const {
  setName,
  setMusicEnabled,
  levelOperationUp,
  levelUserUp,
  completeChalange,
  buyCosmetic,
  equipCosmetic,
  completeMinigame,
  syncProgress,
} = userSlice.actions;
export default userSlice.reducer;
