/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const challengeGetAll = restAPICall(
  "mathematador",
  "challengeGetAll",
  async (request, response): Promise<void> => {
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
        operationId: row.operation_id as any,
        minigame: row.minigame as any,
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

    response.status(200).json(challenges as any);
  }
);
