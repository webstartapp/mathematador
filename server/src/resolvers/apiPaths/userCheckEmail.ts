import { CredentialsEmail } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const userCheckEmail = restAPICall(
  "mathematador",
  "userCheckEmail",
  async (request, response): Promise<void> => {
    const { email } = request.body;

    const userRecord = await knex("users").where("email", email).first();

    response.status(200).json({ exists: Boolean(userRecord) });
  },
  {
    body: CredentialsEmail
  }
);
