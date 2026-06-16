import { Knex } from "knex";

import { CosmeticsEquipBody } from "@/_generated/be_fe.zod";
import { rawKnex } from "@/knexWrapper";
import { getUserProgress } from "@/utils/gameProgress";
import { restAPICall } from "@/utils/restAPI";

export const cosmeticsEquip = restAPICall(
  "mathematador",
  "cosmeticsEquip",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    const { cosmeticId, equipped } = request.body;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      await rawKnex.transaction(async (transactionObject: Knex.Transaction) => {
        // Verify the user owns this cosmetic
        const userCosmetic = await transactionObject("user_cosmetics")
          .where({ user_id: userId, cosmetic_id: cosmeticId })
          .first();

        if (!userCosmetic) {
          throw new Error("You do not own this cosmetic");
        }

        if (equipped) {
          // Unequip all other cosmetics of the same type first
          await transactionObject("user_cosmetics")
            .where({ user_id: userId, cosmetic_type: userCosmetic.cosmetic_type })
            .update({ equipped: false });

          // Equip this cosmetic
          await transactionObject("user_cosmetics").where({ id: userCosmetic.id }).update({ equipped: true });
        } else {
          // Unequip this cosmetic
          await transactionObject("user_cosmetics").where({ id: userCosmetic.id }).update({ equipped: false });
        }
      });

      const updatedProgress = await getUserProgress(userId);
      response.status(200).json(updatedProgress);
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error ? caughtError.message : "Failed to update cosmetic equipment status";
      response.status(400).json({ message: errorMessage });
    }
  },
  {
    body: CosmeticsEquipBody
  }
);
