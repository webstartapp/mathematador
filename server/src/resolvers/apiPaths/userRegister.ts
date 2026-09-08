import { RegisterCredentials } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { signToken } from "@/utils/JWT";
import { hashPassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

export const userRegister = restAPICall(
  "mathematador",
  "userRegister",
  async (request, response): Promise<void> => {
    const { email, password, username } = request.body;

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

    // Insert user
    const [newUser] = await knex("users")
      .insert({
        username,
        email,
        password: hashedPassword,
        role: "user"
      })
      .returning("*");

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
