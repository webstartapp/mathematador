/* eslint-disable max-lines */
import * as zod from "zod";

import { ChallengeResultRequest, Exercise as ExerciseSchema, Id, OperationId } from "@/_generated/be_fe.zod";
import { Exercise } from "@/_generated/model";
import knex from "@/knexWrapper";
import { getChallengeConfig } from "@/utils/challengeConfig";
import { getUserProgress } from "@/utils/gameProgress";
import { restAPICall } from "@/utils/restAPI";

const ExercisesSchema = zod.array(ExerciseSchema);

const calculateCorrectCount = (
  parsedExercises: Exercise[],
  results: { userInput?: string }[] | undefined
): { correctCount: number; exercisesWithAnswers: Exercise[] } => {
  let correctCount = 0;
  const exercisesWithAnswers = parsedExercises.map((exercise, index) => {
    const submittedAnswer = results?.[index]?.userInput ?? "";
    const isCorrect = Number(submittedAnswer) === exercise.result;
    if (isCorrect) {
      correctCount++;
    }
    return {
      ...exercise,
      userInput: submittedAnswer
    };
  });
  return { correctCount, exercisesWithAnswers };
};

const updateProgress = async (
  table: "operation_progress" | "minigame_progress",
  whereClause: Record<string, string>,
  insertData: Record<string, number>,
  xpAwarded: number
): Promise<void> => {
  let record = await knex(table).where(whereClause).first();

  if (!record) {
    const [newRecord] = await knex(table)
      .insert({ ...whereClause, ...insertData })
      .returning("*");
    record = newRecord;
  }

  if (!record) {
    return;
  }

  let currentXp = record.xp + xpAwarded;
  let currentLevel = record.level;

  while (currentXp >= currentLevel * 100) {
    currentXp -= currentLevel * 100;
    currentLevel += 1;
  }

  await knex(table).where({ id: record.id }).update({
    xp: currentXp,
    level: currentLevel
  });
};

const handleCosmeticDrop = async (userId: string, operationId: string, isSuccess: boolean): Promise<void> => {
  if (operationId !== "daily_challenge" || !isSuccess) {
    return;
  }

  if (Math.random() < 0.05) {
    const allCosmetics = await knex("cosmetics").select("*");
    const ownedCosmetics = await knex("user_cosmetics").where("user_id", userId).select("cosmetic_id");
    const ownedIds = new Set(ownedCosmetics.map((row) => row.cosmetic_id));

    const unowned = allCosmetics.filter((cosmeticItem) => !ownedIds.has(cosmeticItem.id));
    if (unowned.length > 0) {
      const luckyCosmetic = unowned[Math.floor(Math.random() * unowned.length)];
      await knex("user_cosmetics").insert({
        user_id: userId,
        cosmetic_id: luckyCosmetic.id,
        cosmetic_type: luckyCosmetic.type,
        equipped: false
      });
    }
  }
};

export const challengeUpdateResult = restAPICall(
  "mathematador",
  "challengeUpdateResult",
  async (request, response): Promise<void> => {
    const operationId = request.params.operationId;
    const id = request.params.id;
    const { results, time } = request.body;
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

    if (challengeRecord.completed) {
      response.status(400).json({ message: "Challenge already completed" });
      return;
    }

    const parsedExercises = ExercisesSchema.parse(
      typeof challengeRecord.exercises === "string" ? JSON.parse(challengeRecord.exercises) : challengeRecord.exercises
    );

    const { correctCount, exercisesWithAnswers } = calculateCorrectCount(parsedExercises, results);

    const totalQuestions = parsedExercises.length || 10;
    const wrongCount = totalQuestions - correctCount;

    const config = getChallengeConfig(operationId);

    const isSuccess = wrongCount <= config.allowedMistakes;

    let currentStreak = 0;
    let inspiredAnswersCount = 0;
    parsedExercises.forEach((_exercise, index) => {
      const submittedAnswer = results?.[index]?.userInput ?? "";
      const expectedAnswer = parsedExercises[index].result;
      const isCorrect = Number(submittedAnswer) === expectedAnswer;
      if (isCorrect) {
        if (currentStreak >= 3) {
          inspiredAnswersCount++;
        }
        currentStreak++;
      } else {
        currentStreak = 0;
      }
    });

    const inspiredBonus = isSuccess ? Math.floor(inspiredAnswersCount * (config.xpOnSuccess / totalQuestions)) : 0;

    const xpAwarded = isSuccess ? config.xpOnSuccess + inspiredBonus : config.xpOnFailure;
    const coinsAwarded = isSuccess ? config.coinsOnSuccess : config.coinsOnFailure;

    await updateProgress(
      "operation_progress",
      { user_id: userId, operation_id: operationId },
      { level: 1, xp: 0 },
      xpAwarded
    );
    await updateProgress(
      "minigame_progress",
      { user_id: userId, minigame_id: challengeRecord.minigame },
      { level: 1, xp: 0 },
      xpAwarded
    );
    await handleCosmeticDrop(userId, operationId, isSuccess);

    const finalResult = {
      time,
      results: exercisesWithAnswers,
      correctAnswers: correctCount,
      coins: coinsAwarded,
      xp: xpAwarded
    };

    await knex("challenges")
      .where({ id })
      .update({
        completed: true,
        result: JSON.stringify(finalResult),
        exercises: JSON.stringify(exercisesWithAnswers)
      });

    const updatedProgress = await getUserProgress(userId);

    response.status(200).json(updatedProgress);
  },
  {
    params: zod.object({ operationId: OperationId, id: Id }),
    body: ChallengeResultRequest
  }
);
