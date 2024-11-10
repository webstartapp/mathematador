import knex from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";
import { Request } from "express";
import { IUserProfile } from "@/_generated/sessionOperations";
import { randomUUID } from "crypto";
import { comparePassword, hashPassword } from "@/utils/password";

export const getToken = (req: Request) => {
  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) {
    throw new Error("No token");
  }
  const token = String(bearer).split(" ")[1];
  if (!token) {
    throw new Error("No token");
  }
  return token;
};

export const UserDB = ExpressTypeResolver({
  table: "users",
  resolvers: {
    getUser: async (props: { userId: string }): Promise<IUserProfile> => {
      const user: IUserProfile = await knex("users").where("id", props.userId).select("username", "id");
      (user as any).password = undefined;
      return user;
    },
    loginUser: async (props: { username: string; password: string }): Promise<IUserProfile> => {
      const user = await knex("users").where("username", props.username).first();
      if (!user) {
        throw new Error("User not found");
      }
      const comparedPassword = await comparePassword(props.password, user.password);
      if (!comparedPassword) {
        throw new Error("Invalid password");
      }
      return await UserDB.resolvers.getUser({ userId: user.id });
    },
    changePassword: async (props: { userId: string }, body: { password: string }, context) => {
      if (!context.viewer?.id || context.viewer.id !== props.userId) {
        throw new Error("No user id");
      }
      const hashedPassword = await hashPassword(body.password);
      await knex("users").where("id", props.userId).update({ password: hashedPassword });
      return "Password changed";
    }
  }
});
