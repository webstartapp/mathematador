exports.up = async function (knex) {
  // Append-only - the opposite shape from user_consents (one immutable row
  // per user). Every change to a setting is a new row; "current" value per
  // key is derived by querying the latest row per (user_id, setting_key)
  // rather than kept in a separate table that could drift out of sync.
  await knex.schema.createTable("user_settings_history", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    // timestamptz (not a bare timestamp): a plain `timestamp` column has no
    // timezone of its own, so node-postgres parses it back using the
    // server process's local timezone - every resolver here immediately
    // does `.toISOString()` on it, which would silently shift by the
    // server's UTC offset whenever that process isn't running in UTC.
    // notNullable so the mapper's `.toISOString()` call can never crash on
    // a null.
    table.timestamp("created", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    // Postgres timestamp precision means two writes for the same key
    // landing in the same instant is unlikely but not impossible (e.g.
    // rapid successive toggles) - this monotonic counter (not the primary
    // key; `id` still is) is the tie-breaker so "current" is never
    // ambiguous between rows with an identical `created` value.
    table.bigIncrements("sequence", { primaryKey: false }).notNullable();
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("setting_key").notNullable();
    table.string("setting_value").notNullable();
  });
  // Two indexes for two different query shapes: this one serves the
  // DISTINCT ON (setting_key) "current value" query (userSettingsGetCurrent.ts).
  await knex.raw(
    "CREATE INDEX user_settings_history_user_key_created_idx ON user_settings_history (user_id, setting_key, created DESC, sequence DESC)"
  );
  // ...and this one serves the plain "every row for this user, newest
  // first" history query (userSettingsGetHistory.ts) - the composite index
  // above can't satisfy an ORDER BY on created alone across all keys, since
  // within it rows are only created-sorted *within* each setting_key group.
  await knex.raw(
    "CREATE INDEX user_settings_history_user_created_idx ON user_settings_history (user_id, created DESC, sequence DESC)"
  );
  console.log("User settings history table created");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_settings_history");
};
