import { DatabaseError } from "pg";

import { ConsentRecord } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

const POSTGRES_UNIQUE_VIOLATION = "23505";

export const userConsentRecord = restAPICall(
  "mathematador",
  "userConsentRecord",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    // First consent on file always wins - this account's consent already
    // existed (on some device) before this request, so a later login from a
    // different device must never overwrite the original record.
    const existingConsent = await knex("user_consents").where({ user_id: userId }).first();
    if (existingConsent) {
      response.status(200).json({
        deviceId: existingConsent.device_id,
        consentedAt: existingConsent.consented_at.toISOString()
      });
      return;
    }

    const { deviceId, consentedAt } = request.body;
    const consentedAtDate = new Date(consentedAt);
    if (Number.isNaN(consentedAtDate.getTime())) {
      response.status(400).json({ message: "Invalid consentedAt" });
      return;
    }

    let consentRecord;
    try {
      [consentRecord] = await knex("user_consents")
        .insert({
          user_id: userId,
          device_id: deviceId,
          consented_at: consentedAtDate
        })
        .returning("*");
    } catch (caughtError) {
      // The read-then-insert above is still a race (two near-simultaneous
      // first logins from different devices), so a unique violation here is
      // a real, expected outcome - fall back to whichever row won the race.
      if (caughtError instanceof DatabaseError && caughtError.code === POSTGRES_UNIQUE_VIOLATION) {
        consentRecord = await knex("user_consents").where({ user_id: userId }).first();
      } else {
        throw caughtError;
      }
    }

    if (!consentRecord) {
      response.status(500).json({ message: "Failed to record consent" });
      return;
    }

    response.status(200).json({
      deviceId: consentRecord.device_id,
      consentedAt: consentRecord.consented_at.toISOString()
    });
  },
  {
    body: ConsentRecord
  }
);
