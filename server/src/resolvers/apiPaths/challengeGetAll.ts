/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Request, Response } from "express";

import knex from "@/knexWrapper";

export const challengeGetAll = async (request: Request, response: Response): Promise<void> => {
  const operationId = String(request.params.operationId);
  const userId = request.userId;

  if (!userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const challengeRows = await knex("challenges")
    .where({ user_id: userId, operation_id: operationId })
    .orderBy("created", "desc");

  const challenges = challengeRows.map((row) => {
    const parsedExercises = typeof row.exercises === "string" ? JSON.parse(row.exercises) : row.exercises;
    const parsedResult = row.result ? (typeof row.result === "string" ? JSON.parse(row.result) : row.result) : null;

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
      coins: row.result ? parsedResult?.coins || 0 : 0,
      allowedMistakes: 3
    };
  });

  response.status(200).json(challenges);
};
