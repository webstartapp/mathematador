/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";

import knex from "@/knexWrapper";

export const subscriptionUpdate = async (request: Request, response: Response): Promise<void> => {
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
    type: subscriptionRecord.type,
    autoRenew: subscriptionRecord.auto_renew
  });
};
