exports.up = async function (knex) {
  // Append-only - the opposite shape from user_consents (one immutable row
  // per user). Every change to a setting is a new row; "current" value per
  // key is derived by querying the latest row per (user_id, setting_key)
  // rather than kept in a separate table that could drift out of sync.
  await knex.schema.createTable("user_settings_history", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("setting_key").notNullable();
    table.string("setting_value").notNullable();
  });
  await knex.raw(
    "CREATE INDEX user_settings_history_user_key_created_idx ON user_settings_history (user_id, setting_key, created DESC)"
  );
  console.log("User settings history table created");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_settings_history");
};
