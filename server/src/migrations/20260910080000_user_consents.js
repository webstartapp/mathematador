exports.up = async function (knex) {
  // One row per user - first consent wins (see userConsentRecord.ts resolver).
  // device_id/consented_at capture the *original* pre-login, device-local
  // acceptance (issue #31), not the moment this row is written - proving
  // consent existed before the account did.
  await knex.schema.createTable("user_consents", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable().unique();
    table.string("device_id").notNullable();
    table.timestamp("consented_at").notNullable();
  });
  console.log("User consents table created");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_consents");
};
