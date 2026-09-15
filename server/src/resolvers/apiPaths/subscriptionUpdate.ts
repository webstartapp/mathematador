import { SubscriptionUpdateBody } from "@/_generated/be_fe.zod";
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

    // Atomic upsert (not a check-then-insert/update) - the previous
    // check-then-branch had a race where two concurrent calls for a brand
    // new user could both see no existing row and both insert one; the
    // subscriptions.user_id unique constraint plus onConflict here makes
    // this a single atomic statement instead.
    const [subscriptionRecord] = await knex("subscriptions")
      .insert({
        user_id: userId,
        type,
        auto_renew: autoRenew
      })
      .onConflict("user_id")
      .merge({
        type,
        auto_renew: autoRenew
      })
      .returning("*");

    response.status(200).json({
      id: subscriptionRecord.id,
      type: subscriptionRecord.type,
      autoRenew: subscriptionRecord.auto_renew
    });
  },
  {
    body: SubscriptionUpdateBody
  }
);
