import { CredentialsEmail } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

export const userForgotten = restAPICall(
  "mathematador",
  "userForgotten",
  async (request, response): Promise<void> => {
    const { email } = request.body;

    const userRecord = await knex("users").where("email", email).first();
    if (!userRecord) {
      response.status(404).json({ message: "User not found" });
      return;
    }

    response.status(201).json({ message: "User found" });
  },
  {
    body: CredentialsEmail
  }
);
