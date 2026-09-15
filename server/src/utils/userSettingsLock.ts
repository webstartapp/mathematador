import { Knex } from "knex";

import { rawKnex } from "@/knexWrapper";

// Serializes writes to user_settings_history for the same account across
// concurrent requests (e.g. a Settings-screen toggle racing the post-login
// consent check-and-seed, both deciding what "the current value" should be
// at nearly the same moment). Postgres advisory locks are the standard
// idiom for coordinating around a logical resource - "this account's
// settings history" - that has no single row of its own to lock via
// SELECT ... FOR UPDATE. pg_advisory_xact_lock (not the session-scoped
// variant) releases automatically when the transaction ends, so a crashed
// request can never leave the lock held.
export const withUserSettingsLock = async <ReturnValueType>(
  userId: string,
  action: (transactionObject: Knex.Transaction) => Promise<ReturnValueType>
): Promise<ReturnValueType> => {
  return rawKnex.transaction(async (transactionObject: Knex.Transaction) => {
    await transactionObject.raw("SELECT pg_advisory_xact_lock(hashtext(?))", [userId]);
    return action(transactionObject);
  });
};
