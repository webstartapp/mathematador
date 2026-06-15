import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const subscriptionCancelImmediately = restAPICall(
  "mathematador",
  "subscriptionCancelImmediately",
  async (request, response): Promise<void> => {
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Delete subscription for this user
    await knex("subscriptions").where({ user_id: userId }).delete();

    response.status(200).json({ message: "Subscription cancelled successfully" });
  }
);
