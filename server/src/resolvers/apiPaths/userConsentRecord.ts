import { ConsentRecord } from "@/_generated/be_fe.zod";
import { restAPICall } from "@/utils/restAPI";
import { withUserSettingsLock } from "@/utils/userSettingsLock";

// Tolerates ordinary client/server clock drift, not a real future date.
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
// Sanity floor, not a real launch date - this field is the "consent
// predates the account" proof (#31), so a client submitting an
// obviously-fabricated timestamp (epoch zero, a typo'd year) shouldn't be
// accepted as evidence of anything.
const EARLIEST_VALID_CONSENT_DATE = new Date("2020-01-01T00:00:00.000Z");

const CONSENT_SETTING_KEYS = ["ads_consent", "gdpr_consent"] as const;

interface ConsentProof {
  deviceId: string;
  consentedAt: Date;
}

export const userConsentRecord = restAPICall(
  "mathematador",
  "userConsentRecord",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
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

    // Locked so this check-then-insert can never race a concurrent
    // Settings-screen toggle (userSettingsUpdate.ts takes the same lock) -
    // without it, a toggle and this seed could both decide what "the
    // current value" is at nearly the same moment, with one silently
    // clobbering the other.
    const consentProof: ConsentProof = await withUserSettingsLock(userId, async (transactionObject) => {
      // First consent on file always wins - user_consents used to be a
      // separate table enforcing exactly this (one immutable row per
      // user), but its write path (like every write path here) only ever
      // runs post-login, so there was never a real reason to keep it apart
      // from user_settings_history. The oldest ads_consent/gdpr_consent row
      // for this account (from any device) *is* that same "predates the
      // account" proof - a later login from a different device must never
      // overwrite it.
      const existingRows = await transactionObject("user_settings_history")
        .where({ user_id: userId })
        .whereIn("setting_key", CONSENT_SETTING_KEYS)
        .orderBy([
          { column: "created", order: "asc" },
          { column: "id", order: "asc" }
        ]);

      const alreadySeededKeys = new Set(existingRows.map((row) => row.setting_key));
      const rowsToInsert = CONSENT_SETTING_KEYS.filter((settingKey) => !alreadySeededKeys.has(settingKey)).map(
        (settingKey) => ({
          user_id: userId,
          setting_key: settingKey,
          setting_value: "true",
          created: existingRows[0]?.created ?? consentedAtDate,
          device_id: existingRows[0]?.device_id ?? deviceId
        })
      );

      if (rowsToInsert.length > 0) {
        await transactionObject("user_settings_history").insert(rowsToInsert);
      }

      if (existingRows.length > 0) {
        return { deviceId: existingRows[0].device_id, consentedAt: existingRows[0].created };
      }
      return { deviceId, consentedAt: consentedAtDate };
    });

    response.status(200).json({
      deviceId: consentProof.deviceId,
      consentedAt: consentProof.consentedAt.toISOString()
    });
  },
  {
    body: ConsentRecord
  }
);
