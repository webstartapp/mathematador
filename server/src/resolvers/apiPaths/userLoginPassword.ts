import { CredentialsPassword } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { hashPassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

export const userLoginPassword = restAPICall(
  "mathematador",
  "userLoginPassword",
  async (request, response): Promise<void> => {
    const { password } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userRecord = await knex("users").where("id", userId).first();

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
      role: userRecord.role,
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
