import { restAPICall } from "@/utils/restAPI";

export const userForgottenPassword = restAPICall(
  "mathematador",
  "userForgottenPassword",
  async (request, response): Promise<void> => {
    // Stub forgotten password email send
    response.status(201).json({ message: "Email sent" });
  }
);
