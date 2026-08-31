import * as zod from "zod";

import { Exercise, ChallengeResultRequest, OperationId } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

const ExercisesSchema = zod.array(Exercise);

export const challengeGetAll = restAPICall(
  "mathematador",
  "challengeGetAll",
  async (request, response): Promise<void> => {
    const operationId = OperationId.parse(request.params.operationId);
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const challengeRows = await knex("challenges")
      .where({ user_id: userId, operation_id: operationId })
      .orderBy("created", "desc");

    const challenges = challengeRows.map((row) => {
      const parsedExercises = ExercisesSchema.parse(
        typeof row.exercises === "string" ? JSON.parse(row.exercises) : row.exercises
      );
      const parsedResult = row.result
        ? ChallengeResultRequest.parse(typeof row.result === "string" ? JSON.parse(row.result) : row.result)
        : null;

      return {
        id: row.id,
        userId: row.user_id,
        operationId: row.operation_id,
        minigame: row.minigame,
        exercises: parsedExercises,
        result: parsedResult || undefined,
        maxTime: 60,
        xpOnSuccess: 20,
        xpOnFailure: 5,
        coinsOnSuccess: 10,
        coinsOnFailure: 2,
        coins: parsedResult?.coins || 0,
        allowedMistakes: 3
      };
    });

    response.status(200).json(challenges);
  },
  {
    params: zod.object({ operationId: OperationId })
  }
);
