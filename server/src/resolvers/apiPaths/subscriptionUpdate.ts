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

    let subscriptionRecord;
    if (type) {
      // Atomic upsert (not a check-then-insert/update) - the previous
      // check-then-branch had a race where two concurrent calls for a
      // brand new user could both see no existing row and both insert one;
      // the subscriptions.user_id unique constraint plus onConflict here
      // makes this a single atomic statement instead. Safe regardless of
      // whether a row already exists, because `type` (which has no column
      // default) is present in both the insert values and the
      // conflict-update values.
      const [upsertedRecord] = await knex("subscriptions")
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
      subscriptionRecord = upsertedRecord;
    } else {
      // `type` is optional in the request body (an auto-renew-only update
      // to an existing subscription doesn't need to repeat it), but it has
      // no column default - a plain UPDATE (never an INSERT) is the only
      // safe thing to do here: it can't violate the NOT NULL constraint,
      // and it's still race-free against a concurrent first-ever create,
      // since that create either lands before this (this then updates the
      // new row) or after (this affects zero rows, correctly reported
      // below rather than silently doing nothing).
      const [updatedRecord] = await knex("subscriptions")
        .where({ user_id: userId })
        .update({ auto_renew: autoRenew })
        .returning("*");
      if (!updatedRecord) {
        response.status(400).json({ message: "type is required to create a new subscription" });
        return;
      }
      subscriptionRecord = updatedRecord;
    }

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
