/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Request, Response } from "express";

import knex from "@/knexWrapper";

export const userForgotten = async (request: Request, response: Response): Promise<void> => {
  const { email } = request.body;

  const userRecord = await knex("users").where("email", email).first();
  if (!userRecord) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.status(201).json({ message: "User found" });
};
