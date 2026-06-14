import { Request, Response } from "express";

import { getUserProgress } from "@/utils/gameProgress";

export const gameProgress = async (request: Request, response: Response): Promise<void> => {
  const userId = request.userId;

  if (!userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const progress = await getUserProgress(userId);
  response.status(200).json(progress);
};
