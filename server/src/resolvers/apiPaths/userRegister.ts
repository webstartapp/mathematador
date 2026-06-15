import { Credentials } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { signToken } from "@/utils/JWT";
import { hashPassword } from "@/utils/password";
import { restAPICall } from "@/utils/restAPI";

export const userRegister = restAPICall(
  "mathematador",
  "userRegister",
  async (request, response): Promise<void> => {
    const { email, password } = request.body;

    // Check if email already registered
    const existingUser = await knex("users").where("email", email).first();
    if (existingUser) {
      response.status(400).json({ message: "Email already registered" });
      return;
    }

    // Create username from email
    const username = email;

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
      subscription: undefined
    });
  },
  {
    body: Credentials
  }
);
