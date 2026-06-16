import * as zod from "zod";

import { ChallengeRequest, OperationId } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { getChallengeConfig } from "@/utils/challengeConfig";
import { generateExercises } from "@/utils/mathGenerator";
import { restAPICall } from "@/utils/restAPI";

export const challengeStartNew = restAPICall(
  "mathematador",
  "challengeStartNew",
  async (request, response): Promise<void> => {
    const operationId = OperationId.parse(request.params.operationId);
    const { minigame = "singleLine" } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const config = getChallengeConfig(operationId);

    // Get user's level for this operation, default to 1
    let progressRecord = await knex("operation_progress").where({ user_id: userId, operation_id: operationId }).first();

    if (!progressRecord) {
      // Initialize progress if it doesn't exist
      const [newProgress] = await knex("operation_progress")
        .insert({
          user_id: userId,
          operation_id: operationId,
          level: 1,
          xp: 0
        })
        .returning("*");
      progressRecord = newProgress;
    }

    // Generate exercises for this level
    const exercises = generateExercises(operationId, progressRecord.level, config.count);

    // Create challenge
    const [challengeRecord] = await knex("challenges")
      .insert({
        user_id: userId,
        operation_id: operationId,
        minigame,
        exercises: JSON.stringify(exercises),
        completed: false,
        result: null
      })
      .returning("*");

    // Format return object
    response.status(200).json({
      id: challengeRecord.id,
      userId: challengeRecord.user_id,
      operationId: challengeRecord.operation_id,
      minigame: challengeRecord.minigame,
      exercises,
      result: undefined,
      maxTime: config.maxTime,
      xpOnSuccess: config.xpOnSuccess,
      xpOnFailure: config.xpOnFailure,
      coinsOnSuccess: config.coinsOnSuccess,
      coinsOnFailure: config.coinsOnFailure,
      coins: 0,
      allowedMistakes: config.allowedMistakes
    });
  },
  {
    params: zod.object({ operationId: OperationId }),
    body: ChallengeRequest
  }
);
