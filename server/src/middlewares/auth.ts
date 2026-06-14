import { NextFunction, Request, Response } from "express";

import knex from "@/knexWrapper";
import { tokenContext } from "@/utils/JWT";

export const requireAuth = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = request.headers.authorization || request.headers.Authorization;
    if (!authorizationHeader) {
      response.status(401).json({ message: "No authorization header provided" });
      return;
    }

    const tokenParts = String(authorizationHeader).split(" ");
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== "bearer") {
      response.status(401).json({ message: "Invalid authorization format. Must be Bearer <token>" });
      return;
    }

    const token = tokenParts[1];
    const decodedToken = tokenContext(token);

    if (!decodedToken || !decodedToken.userId) {
      response.status(401).json({ message: "Invalid token" });
      return;
    }

    // Verify user exists in database
    const userRecord = await knex("users").where("id", decodedToken.userId).first();
    if (!userRecord) {
      response.status(401).json({ message: "User not found" });
      return;
    }

    // Attach user information to request
    request.userId = userRecord.id;
    request.userRole = userRecord.role;

    next();
  } catch (error) {
    response.status(401).json({
      message: error instanceof Error ? error.message : "Authentication failed"
    });
  }
};
