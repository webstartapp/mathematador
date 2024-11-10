import { ITokenBody } from "@/_generated/sessionOperations";
import JWT from "jsonwebtoken";

export const tokenContext = (token: string): ITokenBody => {
  const validToken = verifyToken(token);
  if (!validToken) {
    throw new Error("Invalid token");
  }
  const tokenData = JWT.decode(token);
  if (!tokenData) {
    throw new Error("Invalid token");
  }
  return tokenData as ITokenBody;
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return JWT.verify(token, secret);
};

export const signToken = (data: ITokenBody) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return JWT.sign(data, secret);
};
