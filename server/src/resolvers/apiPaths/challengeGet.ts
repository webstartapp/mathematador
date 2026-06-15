import * as zod from "zod";

import { Exercise, ChallengeResultRequest, OperationId, Id } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

const ExercisesSchema = zod.array(Exercise);

export const challengeGet = restAPICall(
  "mathematador",
  "challengeGet",
  async (request, response): Promise<void> => {
    const operationId = request.params.operationId;
    const id = request.params.id;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const challengeRecord = await knex("challenges").where({ id, user_id: userId, operation_id: operationId }).first();

    if (!challengeRecord) {
      response.status(404).json({ message: "Challenge not found" });
      return;
    }

    const parsedExercises = ExercisesSchema.parse(
      typeof challengeRecord.exercises === "string" ? JSON.parse(challengeRecord.exercises) : challengeRecord.exercises
    );

    const parsedResult = challengeRecord.result
      ? ChallengeResultRequest.parse(
          typeof challengeRecord.result === "string" ? JSON.parse(challengeRecord.result) : challengeRecord.result
        )
      : null;

    response.status(200).json({
      id: challengeRecord.id,
      userId: challengeRecord.user_id,
      operationId: challengeRecord.operation_id,
      minigame: challengeRecord.minigame,
      exercises: parsedExercises,
      result: parsedResult || undefined,
      maxTime: 60,
      xpOnSuccess: 20,
      xpOnFailure: 5,
      coinsOnSuccess: 10,
      coinsOnFailure: 2,
      coins: parsedResult?.coins || 0,
      allowedMistakes: 3
    });
  },
  {
    params: zod.object({ operationId: OperationId, id: Id })
  }
);
