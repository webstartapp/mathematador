/* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import knex from "@/knexWrapper";
import { generateExercises } from "@/utils/mathGenerator";
import { restAPICall } from "@/utils/restAPI";

export const challengeStartNew = restAPICall(
  "mathematador",
  "challengeStartNew",
  async (request, response): Promise<void> => {
    const operationId = String(request.params.operationId);
    const { minigame = "singleLine" } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

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

    // Generate 10 exercises for this level
    const exercises = generateExercises(operationId, progressRecord.level, 10);

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
      operationId: challengeRecord.operation_id as any,
      minigame: challengeRecord.minigame as any,
      exercises,
      result: undefined,
      maxTime: 60,
      xpOnSuccess: 20,
      xpOnFailure: 5,
      coinsOnSuccess: 10,
      coinsOnFailure: 2,
      coins: 0,
      allowedMistakes: 3
    });
  }
);
