import jwtLib from "jsonwebtoken";

export interface ITokenBody {
  userId: string;
  role: string;
}

export const tokenContext = (token: string): ITokenBody => {
  const validToken = verifyToken(token);
  if (!validToken) {
    throw new Error("Invalid token");
  }
  const tokenData = jwtLib.decode(token);
  if (typeof tokenData === "string" || !tokenData) {
    throw new Error("Invalid token");
  }
  const { userId, role } = tokenData;
  if (typeof userId === "string" && typeof role === "string") {
    return { userId, role };
  }
  throw new Error("Invalid token structure");
};

export const verifyToken = (token: string): string | jwtLib.JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return jwtLib.verify(token, secret);
};

export const signToken = (data: ITokenBody): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return jwtLib.sign(data, secret);
};
