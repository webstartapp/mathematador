import { Knex } from "knex";

import { ChallengeResultRequest, CosmeticsBuyBody } from "@/_generated/be_fe.zod";
import { rawKnex } from "@/knexWrapper";
import { getUserProgress } from "@/utils/gameProgress";
import { restAPICall } from "@/utils/restAPI";

export const cosmeticsBuy = restAPICall(
  "mathematador",
  "cosmeticsBuy",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    const { cosmeticId } = request.body;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      await rawKnex.transaction(async (transactionObject: Knex.Transaction) => {
        // Acquire lock on the user's row in the users table to prevent concurrent purchase requests
        await transactionObject("users").where("id", userId).forUpdate();

        // 1. Fetch cosmetic details
        const cosmetic = await transactionObject("cosmetics").where("id", cosmeticId).first();
        if (!cosmetic) {
          throw new Error("Cosmetic not found");
        }

        // 2. Check if already purchased
        const alreadyOwned = await transactionObject("user_cosmetics")
          .where({ user_id: userId, cosmetic_id: cosmeticId })
          .first();
        if (alreadyOwned) {
          throw new Error("Cosmetic already purchased");
        }

        // 3. Compute overall level to verify requirements
        const progressRows = await transactionObject("operation_progress").where("user_id", userId);
        const minigameProgressRows = await transactionObject("minigame_progress").where("user_id", userId);
        const overallLevel = Math.max(
          1,
          progressRows.reduce(
            (accumulatedSum: number, progressRow: { level: number }) => accumulatedSum + progressRow.level,
            0
          ) +
            minigameProgressRows.reduce(
              (accumulatedSum: number, progressRow: { level: number }) => accumulatedSum + progressRow.level,
              0
            ) -
            9
        );

        if (overallLevel < cosmetic.required_level) {
          throw new Error(`Insufficient level. Requires level ${cosmetic.required_level}.`);
        }

        // 4. Calculate dynamic balance
        const challengeRows = await transactionObject("challenges").where({ user_id: userId, completed: true });
        let totalCoins = 0;
        challengeRows.forEach((challengeRow) => {
          if (challengeRow.result) {
            const parsedResult = ChallengeResultRequest.parse(
              typeof challengeRow.result === "string" ? JSON.parse(challengeRow.result) : challengeRow.result
            );
            totalCoins += parsedResult.coins || 0;
          }
        });

        const userCosmetics = await transactionObject("user_cosmetics").where("user_id", userId);
        const purchasedIds = userCosmetics.map((cosmeticItem: { cosmetic_id: string }) => cosmeticItem.cosmetic_id);

        let spentCoins = 0;
        if (purchasedIds.length > 0) {
          const cosmeticsList = await transactionObject("cosmetics").whereIn("id", purchasedIds);
          spentCoins = cosmeticsList.reduce(
            (accumulatedSum: number, cosmeticItem: { price: number }) => accumulatedSum + cosmeticItem.price,
            0
          );
        }

        const balance = Math.max(0, totalCoins - spentCoins);

        if (balance < cosmetic.price) {
          throw new Error("Insufficient coins balance");
        }

        // 5. Insert new user cosmetic record
        await transactionObject("user_cosmetics").insert({
          user_id: userId,
          cosmetic_id: cosmeticId,
          cosmetic_type: cosmetic.type,
          equipped: false
        });
      });

      // Fetch and return the updated game progress
      const updatedProgress = await getUserProgress(userId);
      response.status(200).json(updatedProgress);
    } catch (caughtError) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : "Failed to purchase cosmetic";
      response.status(400).json({ message: errorMessage });
    }
  },
  {
    body: CosmeticsBuyBody
  }
);
