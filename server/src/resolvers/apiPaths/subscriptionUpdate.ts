/* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const subscriptionUpdate = restAPICall(
  "mathematador",
  "subscriptionUpdate",
  async (request, response): Promise<void> => {
    const { type, autoRenew = true } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if subscription exists
    const existingSub = await knex("subscriptions").where({ user_id: userId }).first();

    let subscriptionRecord;
    if (existingSub) {
      // Update
      const [updatedSub] = await knex("subscriptions")
        .where({ id: existingSub.id })
        .update({
          type,
          auto_renew: autoRenew
        })
        .returning("*");
      subscriptionRecord = updatedSub;
    } else {
      // Create new
      const [newSub] = await knex("subscriptions")
        .insert({
          user_id: userId,
          type,
          auto_renew: autoRenew
        })
        .returning("*");
      subscriptionRecord = newSub;
    }

    response.status(200).json({
      id: subscriptionRecord.id,
      type: subscriptionRecord.type as any,
      autoRenew: subscriptionRecord.auto_renew
    });
  }
);
