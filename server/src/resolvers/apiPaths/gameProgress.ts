import { getUserProgress } from "@/utils/gameProgress";
import { restAPICall } from "@/utils/restAPI";

export const gameProgress = restAPICall("mathematador", "gameProgress", async (request, response): Promise<void> => {
  const userId = request.userId;

  if (!userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const progress = await getUserProgress(userId);
  response.status(200).json(progress);
});
