import { Request, Response } from "express";

export const userForgottenPassword = async (request: Request, response: Response): Promise<void> => {
  // Stub forgotten password email send
  response.status(201).json({ message: "Email sent" });
};
