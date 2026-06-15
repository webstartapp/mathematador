import * as zod from "zod";

import { ChallengeResultRequest, Exercise } from "@/_generated/be_fe.zod";
import { GameProgress, Challenge } from "@/_generated/model";
import knex from "@/knexWrapper";

const ExercisesSchema = zod.array(Exercise);

export const getUserProgress = async (userId: string): Promise<GameProgress> => {
  // 1. Get all operation progress
  const progressRows = await knex("operation_progress").where("user_id", userId);

  // Make sure we have rows for all 4 operations
  const operationsList = ["addition", "subtraction", "multiplication", "division"];
  const progressMap = new Map<string, (typeof progressRows)[number]>(
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

  // Get the complete array
  const allProgress = Array.from(progressMap.values());

  // 2. Fetch all user challenges
  const challengeRows = await knex("challenges").where("user_id", userId).orderBy("created", "desc");

  // 3. Compute total coins
  let totalCoins = 0;
  challengeRows.forEach((rowItem) => {
    if (rowItem.result) {
      const parsedResult = ChallengeResultRequest.parse(JSON.parse(rowItem.result));
      totalCoins += parsedResult.coins || 0;
    }
  });

  // 4. Compute overall level & XP
  const overallLevel = Math.max(1, allProgress.reduce((runningSum, rowItem) => runningSum + rowItem.level, 0) - 3);
  const overallXp = allProgress.reduce((runningSum, rowItem) => runningSum + rowItem.xp, 0);

  // 5. Construct operations progress details
  const operationsProgressDetails = allProgress.map((progressItem) => {
    const opChallenges = challengeRows
      .filter((challengeItem) => challengeItem.operation_id === progressItem.operation_id)
      .map((rowItem) => {
        const parsedExercises = ExercisesSchema.parse(JSON.parse(rowItem.exercises));
        const parsedResult = rowItem.result ? ChallengeResultRequest.parse(JSON.parse(rowItem.result)) : undefined;

        const coinsValue = parsedResult?.coins || 0;

        const resultObj: Challenge = {
          id: rowItem.id,
          userId: rowItem.user_id,
          operationId: rowItem.operation_id,
          minigame: rowItem.minigame,
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
        return resultObj;
      });

    return {
      level: progressItem.level,
      xp: progressItem.xp,
      challenges: opChallenges
    };
  });

  return {
    level: overallLevel,
    xp: overallXp,
    coins: totalCoins,
    operations: operationsProgressDetails
  };
};
