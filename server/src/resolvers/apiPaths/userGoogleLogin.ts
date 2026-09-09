import { OAuth2Client } from "google-auth-library";

import { GoogleIdToken } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { UserRow } from "@/types/KnexDBType";
import { signToken } from "@/utils/JWT";
import { restAPICall } from "@/utils/restAPI";

const USERNAME_ATTEMPT_LIMIT = 5;

const sanitizeToUsername = (value: string): string => value.toLowerCase().replace(/[^a-z0-9_]/g, "");

// Prefers the Google account's display name (nicer for the "Welcome, {name}"
// greeting) over the email's local-part, sanitized to fit the username
// column's constraints.
const deriveBaseUsername = (email: string, name: string | undefined): string => {
  const sanitizedName = name ? sanitizeToUsername(name) : "";
  if (sanitizedName) {
    return sanitizedName;
  }
  const emailLocalPart = email.split("@")[0] ?? "player";
  return sanitizeToUsername(emailLocalPart) || "player";
};

// Google sign-in never collects a username directly, so one is generated
// and de-duplicated against existing rows - falling back to a slice of the
// Google account id to guarantee a free one is found.
const generateAvailableUsername = async (
  email: string,
  name: string | undefined,
  googleId: string
): Promise<string> => {
  const baseUsername = deriveBaseUsername(email, name);
  for (let attempt = 0; attempt < USERNAME_ATTEMPT_LIMIT; attempt += 1) {
    const candidate = attempt === 0 ? baseUsername : `${baseUsername}${Math.floor(Math.random() * 10000)}`;
    const existing = await knex("users").where("username", candidate).first();
    if (!existing) {
      return candidate;
    }
  }
  return `${baseUsername}_${googleId.slice(-8)}`;
};

const findOrCreateGoogleUser = async (googleId: string, email: string, name: string | undefined): Promise<UserRow> => {
  const linkedUser = await knex("users").where("google_id", googleId).first();
  if (linkedUser) {
    return linkedUser;
  }

  const existingEmailUser = await knex("users").where("email", email).first();
  if (existingEmailUser) {
    const [relinkedUser] = await knex("users")
      .where("id", existingEmailUser.id)
      .update({ google_id: googleId })
      .returning("*");
    return relinkedUser;
  }

  const username = await generateAvailableUsername(email, name, googleId);
  const [newUser] = await knex("users")
    .insert({
      username,
      email,
      password: null,
      google_id: googleId,
      role: "user"
    })
    .returning("*");
  return newUser;
};

export const userGoogleLogin = restAPICall(
  "mathematador",
  "userGoogleLogin",
  async (request, response): Promise<void> => {
    const { idToken } = request.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      response.status(500).json({ message: "Google sign-in is not configured" });
      return;
    }

    const oauthClient = new OAuth2Client(googleClientId);
    let payload;
    try {
      const ticket = await oauthClient.verifyIdToken({ idToken, audience: googleClientId });
      payload = ticket.getPayload();
    } catch {
      response.status(401).json({ message: "Invalid Google credential" });
      return;
    }

    if (!payload?.email || !payload.email_verified) {
      response.status(401).json({ message: "Invalid Google credential" });
      return;
    }

    const userRecord = await findOrCreateGoogleUser(payload.sub, payload.email, payload.name);

    const token = signToken({ userId: userRecord.id, role: userRecord.role });
    response.setHeader("Authorization", `Bearer ${token}`);
    response.status(200).json({
      id: userRecord.id,
      name: userRecord.username,
      role: userRecord.role,
      subscription: undefined
    });
  },
  {
    body: GoogleIdToken
  }
);
