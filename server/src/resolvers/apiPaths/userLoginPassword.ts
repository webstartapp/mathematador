import { CredentialsPassword } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { hashPassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

export const userLoginPassword = restAPICall(
  "mathematador",
  "userLoginPassword",
  async (request, response): Promise<void> => {
    const { password } = request.body;
    const userId = request.userId; // If authenticated

    let userRecord;
    if (userId) {
      userRecord = await knex("users").where("id", userId).first();
    } else {
      // Fallback to first user in database
      userRecord = await knex("users").first();
    }

    if (!userRecord) {
      response.status(404).json({ message: "User not found" });
      return;
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      await knex("users").where("id", userRecord.id).update({ password: hashedPassword });
    }

    // Get user's subscription
    const subscriptionRecord = await knex("subscriptions").where("user_id", userRecord.id).first();

    response.status(200).json({
      id: userRecord.id,
      name: userRecord.username,
      subscription: subscriptionRecord
        ? {
            id: subscriptionRecord.id,
            type: subscriptionRecord.type,
            autoRenew: subscriptionRecord.auto_renew
          }
        : undefined
    });
  },
  {
    body: CredentialsPassword
  }
);
