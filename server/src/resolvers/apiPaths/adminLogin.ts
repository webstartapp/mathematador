import { Iadmin_loginCallResolver } from "@/_generated/sessionOperations";
import { UserDB } from "@/entities/user/user";
import { signToken } from "@/utils/JWT";

const loginUser: Iadmin_loginCallResolver = async (props, body, context) => {
  const user = await UserDB.resolvers.loginUser(body);
  context.responseHeaders.Authorization = `Bearer ${signToken({
    userId: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    iat: Math.floor(Date.now() / 1000)
  })}`;
  return user;
};

export default loginUser;
