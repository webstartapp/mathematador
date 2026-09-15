import { DatabaseError } from "pg";

import { ConsentRecord } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

const POSTGRES_UNIQUE_VIOLATION = "23505";
// Tolerates ordinary client/server clock drift, not a real future date.
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
// Sanity floor, not a real launch date - this field is the "consent
// predates the account" proof (#31), so a client submitting an
// obviously-fabricated timestamp (epoch zero, a typo'd year) shouldn't be
// accepted as evidence of anything.
const EARLIEST_VALID_CONSENT_DATE = new Date("2020-01-01T00:00:00.000Z");

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
    const isOutOfRange =
      Number.isNaN(consentedAtDate.getTime()) ||
      consentedAtDate.getTime() > Date.now() + MAX_CLOCK_SKEW_MS ||
      consentedAtDate < EARLIEST_VALID_CONSENT_DATE;
    if (isOutOfRange) {
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
      // Seeds the settings-history log (#32) with the consent this account
      // is giving right now, so Settings' Change History view has a real
      // first entry instead of starting empty until this account's first
      // manual toggle there. Best-effort: a failure here must not undo or
      // fail the consent record itself, which is already durably saved
      // above - and only runs on this genuinely-new-row path, never on the
      // existingConsent early return or the unique-violation race fallback
      // below, so a returning login never re-seeds duplicate entries.
      await knex("user_settings_history")
        .insert([
          { user_id: userId, setting_key: "ads_consent", setting_value: "true" },
          { user_id: userId, setting_key: "gdpr_consent", setting_value: "true" }
        ])
        .catch(() => {
          // Ignored - see comment above.
        });
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
