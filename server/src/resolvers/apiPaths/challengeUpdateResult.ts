/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-argument */
import knex from "@/knexWrapper";
import { getUserProgress } from "@/utils/gameProgress";
import { restAPICall } from "@/utils/restAPI";

export const challengeUpdateResult = restAPICall(
  "mathematador",
  "challengeUpdateResult",
  async (request, response): Promise<void> => {
    const operationId = String(request.params.operationId);
    const id = String(request.params.id);
    const { results, time } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find the challenge
    const challengeRecord = await knex("challenges").where({ id, user_id: userId, operation_id: operationId }).first();

    if (!challengeRecord) {
      response.status(404).json({ message: "Challenge not found" });
      return;
    }

    if (challengeRecord.completed) {
      response.status(400).json({ message: "Challenge already completed" });
      return;
    }

    // Calculate correct answers
    let correctCount = 0;
    const parsedExercises =
      typeof challengeRecord.exercises === "string" ? JSON.parse(challengeRecord.exercises) : challengeRecord.exercises;

    // Map results to exercises for verification
    const exercisesWithAnswers = parsedExercises.map((exercise: any, index: number) => {
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

    const totalQuestions = parsedExercises.length || 10;
    const wrongCount = totalQuestions - correctCount;

    // allowedMistakes is 3, so success is if wrongCount <= 3
    const isSuccess = wrongCount <= 3;
    const xpAwarded = isSuccess ? 20 : 5;
    const coinsAwarded = isSuccess ? 10 : 2;

    // Retrieve user progress
    let progressRecord = await knex("operation_progress").where({ user_id: userId, operation_id: operationId }).first();

    if (!progressRecord) {
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

    let currentXp = progressRecord.xp + xpAwarded;
    let currentLevel = progressRecord.level;

    // Level up logic: next level requires level * 100 XP
    while (currentXp >= currentLevel * 100) {
      currentXp -= currentLevel * 100;
      currentLevel += 1;
    }

    // Update user progress in DB
    await knex("operation_progress").where({ id: progressRecord.id }).update({
      xp: currentXp,
      level: currentLevel
    });

    // Update challenge
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

    // Get compiled updated user progress
    const updatedProgress = await getUserProgress(userId);

    response.status(200).json(updatedProgress as any);
  }
);
