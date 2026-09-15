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

const CONSENT_SETTING_KEYS = ["ads_consent", "gdpr_consent"] as const;

// Seeds the settings-history log (#32) with the consent this account gave,
// so Settings' Change History view has a real first entry instead of
// starting empty until this account's first manual toggle there. Checked
// per-key (not "does any row exist yet") so an account that already has one
// of the two keys - e.g. it toggled ads_consent via Settings before ever
// syncing a gdpr_consent seed - still gets the other one backfilled, rather
// than being skipped entirely. Idempotent and safe to call on every login:
// runs for a brand-new consent row (this account's very first login ever)
// *and* for an already-existing one (an account that consented before this
// backfill existed, or logging in from a second device), which is exactly
// what makes the "no records" gap - reported live - disappear for accounts
// that had already passed the consent gate before this seeding existed.
// Best-effort: a failure here must never fail the consent record response
// itself, which this always runs after having already durably saved.
const seedMissingConsentSettingsHistory = async (userId: string, createdAt: Date): Promise<void> => {
  const existingRows = await knex("user_settings_history")
    .where({ user_id: userId })
    .whereIn("setting_key", CONSENT_SETTING_KEYS)
    .select("setting_key");
  const alreadySeededKeys = new Set(existingRows.map((row) => row.setting_key));
  const rowsToInsert = CONSENT_SETTING_KEYS.filter((settingKey) => !alreadySeededKeys.has(settingKey)).map(
    (settingKey) => ({
      user_id: userId,
      setting_key: settingKey,
      setting_value: "true",
      created: createdAt
    })
  );
  if (rowsToInsert.length > 0) {
    await knex("user_settings_history").insert(rowsToInsert);
  }
};

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
      await seedMissingConsentSettingsHistory(userId, existingConsent.consented_at).catch(() => {
        // Ignored - see seedMissingConsentSettingsHistory's own comment.
      });
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

    await seedMissingConsentSettingsHistory(userId, consentRecord.consented_at).catch(() => {
      // Ignored - see seedMissingConsentSettingsHistory's own comment.
    });

    response.status(200).json({
      deviceId: consentRecord.device_id,
      consentedAt: consentRecord.consented_at.toISOString()
    });
  },
  {
    body: ConsentRecord
  }
);
