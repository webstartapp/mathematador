import * as zod from "zod";

import { ChallengeResultRequest, Exercise } from "@/_generated/be_fe.zod";
import { GameProgress, Challenge } from "@/_generated/model";
import knex from "@/knexWrapper";
import { ChallengeRow } from "@/types/KnexDBType";
import {
  getMinigame,
  getOperationId,
  ensureOperationProgress,
  ensureMinigameProgress,
  getCosmeticsLoadout
} from "@/utils/progressHelpers";

const ExercisesSchema = zod.array(Exercise);

const mapChallengeRow = (rowItem: ChallengeRow): Challenge => {
  const parsedExercises = ExercisesSchema.parse(
    typeof rowItem.exercises === "string" ? JSON.parse(rowItem.exercises) : rowItem.exercises
  );
  const parsedResult = rowItem.result
    ? ChallengeResultRequest.parse(typeof rowItem.result === "string" ? JSON.parse(rowItem.result) : rowItem.result)
    : undefined;

  const coinsValue = parsedResult?.coins || 0;

  return {
    id: rowItem.id,
    userId: rowItem.user_id,
    operationId: getOperationId(rowItem.operation_id),
    minigame: getMinigame(rowItem.minigame),
    exercises: parsedExercises,
    result: parsedResult,
    maxTime: 60,
    xpOnSuccess: 20,
    xpOnFailure: 5,
    coinsOnSuccess: 10,
    coinsOnFailure: 2,
    coins: coinsValue,
    allowedMistakes: 3
  };
};

export const getUserProgress = async (userId: string): Promise<GameProgress> => {
  const rawProgressRows = await knex("operation_progress").where("user_id", userId);
  const allProgress = await ensureOperationProgress(userId, rawProgressRows);

  const challengeRows = await knex("challenges").where("user_id", userId).orderBy("created", "desc");

  let totalCoins = 0;
  challengeRows.forEach((rowItem) => {
    if (rowItem.result) {
      const parsedResult = ChallengeResultRequest.parse(
        typeof rowItem.result === "string" ? JSON.parse(rowItem.result) : rowItem.result
      );
      totalCoins += parsedResult.coins || 0;
    }
  });

  const loadout = await getCosmeticsLoadout(userId, totalCoins);

  const rawMinigameProgressRows = await knex("minigame_progress").where("user_id", userId);
  const allMinigameProgress = await ensureMinigameProgress(userId, rawMinigameProgressRows);

  const overallLevel = Math.max(
    1,
    allProgress.reduce((runningSum, rowItem) => runningSum + rowItem.level, 0) +
      allMinigameProgress.reduce((runningSum, rowItem) => runningSum + rowItem.level, 0) -
      9
  );
  const overallXp =
    allProgress.reduce((runningSum, rowItem) => runningSum + rowItem.xp, 0) +
    allMinigameProgress.reduce((runningSum, rowItem) => runningSum + rowItem.xp, 0);

  const operationsProgressDetails = allProgress.map((progressItem) => {
    const opChallenges = challengeRows
      .filter((challengeItem) => challengeItem.operation_id === progressItem.operation_id)
      .map((rowItem) => mapChallengeRow(rowItem));

    return {
      level: progressItem.level,
      xp: progressItem.xp,
      challenges: opChallenges
    };
  });

  return {
    level: overallLevel,
    xp: overallXp,
    coins: loadout.coinsBalance,
    operations: operationsProgressDetails,
    purchasedCosmetics: loadout.purchasedCosmetics,
    equippedCape: loadout.equippedCape,
    equippedSuit: loadout.equippedSuit,
    equippedFlare: loadout.equippedFlare,
    minigameProgress: allMinigameProgress.map((rowItem) => ({
      minigameId: getMinigame(rowItem.minigame_id) ?? "singleLine",
      level: rowItem.level,
      xp: rowItem.xp
    }))
  };
};
