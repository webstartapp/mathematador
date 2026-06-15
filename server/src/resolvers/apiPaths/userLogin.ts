import { Credentials } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { signToken } from "@/utils/JWT";
import { comparePassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

export const userLogin = restAPICall(
  "mathematador",
  "userLogin",
  async (request, response): Promise<void> => {
    const { email, password } = request.body;

    // Find user by email
    const userRecord = await knex("users").where("email", email).first();
    if (!userRecord) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, userRecord.password);
    if (!passwordMatch) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Get user's subscription
    const subscriptionRecord = await knex("subscriptions").where("user_id", userRecord.id).first();

    // Sign token
    const token = signToken({ userId: userRecord.id, role: userRecord.role });

    // Set Authorization header
    response.setHeader("Authorization", `Bearer ${token}`);

    // Return UserProfile shape
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
    body: Credentials
  }
);
