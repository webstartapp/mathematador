import { DatabaseError } from "pg";

import { RegisterCredentials } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { signToken } from "@/utils/JWT";
import { hashPassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

const POSTGRES_UNIQUE_VIOLATION = "23505";

export const userRegister = restAPICall(
  "mathematador",
  "userRegister",
  async (request, response): Promise<void> => {
    const { email, password } = request.body;
    const username = request.body.username.trim();

    if (!username) {
      response.status(400).json({ message: "Username is required" });
      return;
    }

    // Check if email already registered
    const existingEmail = await knex("users").where("email", email).first();
    if (existingEmail) {
      response.status(400).json({ message: "Email already registered" });
      return;
    }

    // Check if username already taken
    const existingUsername = await knex("users").where("username", username).first();
    if (existingUsername) {
      response.status(400).json({ message: "Username already taken" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user - the two checks above are still a race (two concurrent
    // registrations can both pass them), so a unique-constraint violation
    // here is a real, expected outcome, not just defensive coding.
    let newUser;
    try {
      [newUser] = await knex("users")
        .insert({
          username,
          email,
          password: hashedPassword,
          role: "user"
        })
        .returning("*");
    } catch (caughtError) {
      if (caughtError instanceof DatabaseError && caughtError.code === POSTGRES_UNIQUE_VIOLATION) {
        response.status(400).json({ message: "Email or username already registered" });
        return;
      }
      throw caughtError;
    }

    // Sign token
    const token = signToken({ userId: newUser.id, role: newUser.role });

    // Set Authorization header
    response.setHeader("Authorization", `Bearer ${token}`);

    // Return UserProfile shape
    response.status(200).json({
      id: newUser.id,
      name: newUser.username,
      role: newUser.role,
      subscription: undefined
    });
  },
  {
    body: RegisterCredentials
  }
);
