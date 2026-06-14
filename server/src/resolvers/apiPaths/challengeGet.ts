/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";

import knex from "@/knexWrapper";

export const challengeGet = async (request: Request, response: Response): Promise<void> => {
  const operationId = String(request.params.operationId);
  const id = String(request.params.id);
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

  const parsedExercises =
    typeof challengeRecord.exercises === "string" ? JSON.parse(challengeRecord.exercises) : challengeRecord.exercises;

  const parsedResult = challengeRecord.result
    ? typeof challengeRecord.result === "string"
      ? JSON.parse(challengeRecord.result)
      : challengeRecord.result
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
    coins: challengeRecord.result ? parsedResult?.coins || 0 : 0,
    allowedMistakes: 3
  });
};
