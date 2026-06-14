/* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import knex from "@/knexWrapper";

export interface ChallengeItem {
  id: string;
  userId: string;
  operationId: string;
  minigame: string;
  exercises: any;
  result?: {
    time: number;
    results: any;
    correctAnswers: number;
    coins: number;
    xp: number;
  };
  maxTime: number;
  xpOnSuccess: number;
  xpOnFailure: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
  coins: number;
  allowedMistakes: number;
}

export interface GameProgress {
  level: number;
  xp: number;
  coins: number;
  operations: {
    level: number;
    xp: number;
    challenges: ChallengeItem[];
  }[];
}

interface ProgressRow {
  id: string;
  user_id: string;
  operation_id: string;
  level: number;
  xp: number;
}

interface ChallengeRow {
  id: string;
  user_id: string;
  operation_id: string;
  minigame: string;
  exercises: any;
  result: any;
  completed: boolean;
}

export const getUserProgress = async (userId: string): Promise<GameProgress> => {
  // 1. Get all operation progress
  const progressRows = (await knex("operation_progress").where("user_id", userId)) as any as ProgressRow[];

  // Make sure we have rows for all 4 operations
  const operationsList = ["addition", "subtraction", "multiplication", "division"];
  const progressMap = new Map<string, ProgressRow>(progressRows.map((rowItem) => [rowItem.operation_id, rowItem]));

  for (const operationIdItem of operationsList) {
    if (!progressMap.has(operationIdItem)) {
      const [newOp] = (await knex("operation_progress")
        .insert({
          user_id: userId,
          operation_id: operationIdItem,
          level: 1,
          xp: 0
        })
        .returning("*")) as any as ProgressRow[];
      progressMap.set(operationIdItem, newOp);
    }
  }

  // Get the complete array
  const allProgress = Array.from(progressMap.values());

  // 2. Fetch all user challenges
  const challengeRows = (await knex("challenges")
    .where("user_id", userId)
    .orderBy("created", "desc")) as any as ChallengeRow[];

  // 3. Compute total coins
  let totalCoins = 0;
  challengeRows.forEach((rowItem) => {
    if (rowItem.result) {
      const resultData = (typeof rowItem.result === "string" ? JSON.parse(rowItem.result) : rowItem.result) as Record<
        string,
        any
      >;
      totalCoins += (resultData?.coins as number) || 0;
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
        const parsedExercises =
          typeof rowItem.exercises === "string" ? JSON.parse(rowItem.exercises) : rowItem.exercises;
        const parsedResult = rowItem.result
          ? ((typeof rowItem.result === "string" ? JSON.parse(rowItem.result) : rowItem.result) as Record<string, any>)
          : null;

        const coinsValue = parsedResult ? (parsedResult.coins as number) || 0 : 0;

        const resultObj: ChallengeItem = {
          id: rowItem.id,
          userId: rowItem.user_id,
          operationId: rowItem.operation_id,
          minigame: rowItem.minigame,
          exercises: parsedExercises,
          result: parsedResult
            ? {
                time: (parsedResult.time as number) || 0,
                results: parsedResult.results,
                correctAnswers: (parsedResult.correctAnswers as number) || 0,
                coins: coinsValue,
                xp: (parsedResult.xp as number) || 0
              }
            : undefined,
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
