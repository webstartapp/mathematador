const bcrypt = require("bcryptjs");

// Single consolidated migration representing the full current schema.
// Replaces what used to be a chain of incremental migrations (users,
// cosmetics/progression, email uniqueness, google auth, user_consents,
// user_settings_history, and the later merge of the two) - collapsed into
// one file now that no real environment has data worth preserving across
// that history (the MVP has never gone live). Splitting schema changes into
// many small migrations only earns its complexity once a real database
// needs to evolve without data loss; until then it's just noise to read
// through.
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.string("username").notNullable().unique();
    table.string("email").notNullable().unique();
    // Nullable - a Google-authenticated account has no password of its own.
    table.string("password").nullable();
    table.string("role").notNullable().defaultTo("user");
    table.string("google_id").unique().nullable();
  });
  console.log("Users table created");

  await knex.schema.createTable("subscriptions", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    // unique - one subscription row per user, enforced at the DB level so
    // two concurrent subscriptionUpdate calls for a brand-new user can't
    // both pass the check-then-insert race and each insert their own row
    // (subscriptionUpdate.ts's insert().onConflict("user_id") relies on
    // this constraint existing to upsert atomically instead).
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable().unique();
    table.string("type").notNullable(); // "addsFree" or "full"
    table.boolean("auto_renew").notNullable().defaultTo(true);
  });
  console.log("Subscriptions table created");

  await knex.schema.createTable("challenges", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("operation_id").notNullable(); // "addition", "subtraction", "multiplication", "division"
    table.string("minigame").notNullable(); // "singleLine", "dragAndDrop", "crossNumbers", "memory"
    table.jsonb("exercises").notNullable(); // array of exercise objects
    table.jsonb("result"); // result object (time, results, correctAnswers, coins, xp)
    table.boolean("completed").notNullable().defaultTo(false);
  });
  console.log("Challenges table created");

  await knex.schema.createTable("operation_progress", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("operation_id").notNullable(); // "addition", "subtraction", "multiplication", "division"
    table.integer("level").notNullable().defaultTo(1);
    table.integer("xp").notNullable().defaultTo(0);
    table.unique(["user_id", "operation_id"]);
  });
  console.log("Operation progress table created");

  await knex.schema.createTable("cosmetics", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.string("name").notNullable();
    table.string("type").notNullable(); // "cape" | "suit" | "flare"
    table.integer("price").notNullable();
    table.string("asset_id").notNullable();
    table.integer("required_level").notNullable().defaultTo(1);
  });
  console.log("Cosmetics table created");

  await knex.schema.createTable("user_cosmetics", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.uuid("cosmetic_id").references("id").inTable("cosmetics").onDelete("CASCADE").notNullable();
    table.string("cosmetic_type").notNullable(); // "cape" | "suit" | "flare"
    table.boolean("equipped").notNullable().defaultTo(false);
    table.unique(["user_id", "cosmetic_id"]);
  });
  // Partial unique index: a user can only have one cosmetic of each type
  // equipped at a time.
  await knex.raw(
    "CREATE UNIQUE INDEX user_cosmetics_equipped_unique ON user_cosmetics(user_id, cosmetic_type) WHERE equipped = true"
  );
  console.log("User cosmetics table created with partial unique index for equipped status");

  await knex.schema.createTable("minigame_progress", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("minigame_id").notNullable(); // "singleLine" | "dragAndDrop" | "crossNumbers" | "memory"
    table.integer("level").notNullable().defaultTo(1);
    table.integer("xp").notNullable().defaultTo(0);
    table.unique(["user_id", "minigame_id"]);
  });
  console.log("Minigame progress table created");

  // Append-only settings/consent history - every change (including the
  // original ads/GDPR consent given at signup, #31) is a new row; "current"
  // value per key is derived by querying the latest row per
  // (user_id, setting_key) rather than kept in a separate table that could
  // drift out of sync. The oldest ads_consent/gdpr_consent row for an
  // account doubles as its immutable "consent predates the account" proof -
  // there's no separate table for that, since every write here (like that
  // original consent sync) only ever happens post-login anyway.
  await knex.schema.createTable("user_settings_history", (table) => {
    // A single autoincrementing bigint primary key, not a uuid - unlike
    // every other table's id, this one is never returned in any API
    // response (see userSettingsMapper.ts), so uuid's usual "don't expose
    // a guessable sequential id externally" reason doesn't apply here. That
    // freed this column to also serve as the monotonic ordering tie-
    // breaker a uuid can't provide (uuid_generate_v4() has no inherent
    // order), rather than needing a second, separate `sequence` column
    // alongside a uuid id purely for that purpose.
    table.bigIncrements("id").primary();
    // timestamptz (not a bare timestamp): a plain `timestamp` column has no
    // timezone of its own, so node-postgres parses it back using the
    // server process's local timezone - every resolver here immediately
    // does `.toISOString()` on it, which would silently shift by the
    // server's UTC offset whenever that process isn't running in UTC.
    table.timestamp("created", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("setting_key").notNullable();
    table.string("setting_value").notNullable();
    // Which device made this change - every write (a toggle or the
    // original consent sync) always has one; never optional, so the
    // history view can always say which device a change came from.
    table.string("device_id").notNullable();
  });
  // Two indexes for two different query shapes: this one serves the
  // DISTINCT ON (setting_key) "current value" query (userSettingsGetCurrent.ts).
  // `id DESC` (not `created DESC` alone) breaks ties between rows that land
  // in the same `created` instant (e.g. rapid successive toggles) - a
  // plain timestamp doesn't have enough precision to guarantee otherwise.
  await knex.raw(
    "CREATE INDEX user_settings_history_user_key_created_idx ON user_settings_history (user_id, setting_key, created DESC, id DESC)"
  );
  // ...and this one serves the plain "every row for this user, newest
  // first" history query (userSettingsGetHistory.ts) - the composite index
  // above can't satisfy an ORDER BY on created alone across all keys, since
  // within it rows are only created-sorted *within* each setting_key group.
  await knex.raw(
    "CREATE INDEX user_settings_history_user_created_idx ON user_settings_history (user_id, created DESC, id DESC)"
  );
  console.log("User settings history table created");

  // Default root admin user.
  const salt = await bcrypt.genSalt(10);
  const rootPasswordHash = await bcrypt.hash("cestapoznani", salt);
  await knex("users").insert({
    username: "root",
    password: rootPasswordHash,
    email: "root@example.com",
    role: "admin"
  });
  console.log("Root user created");

  // Default cosmetics shop inventory.
  await knex("cosmetics").insert([
    { name: "Fibonacci Spiral Cape", type: "cape", price: 100, asset_id: "cape_fibonacci", required_level: 1 },
    { name: "Golden Pi Cape", type: "cape", price: 300, asset_id: "cape_pi", required_level: 3 },
    { name: "Matrix Code Suit", type: "suit", price: 200, asset_id: "suit_matrix", required_level: 2 },
    { name: "Neon Sparkle Suit", type: "suit", price: 500, asset_id: "suit_neon", required_level: 4 },
    { name: "Golden Flare", type: "flare", price: 150, asset_id: "flare_golden", required_level: 1 },
    { name: "Sparkling Firework Flare", type: "flare", price: 350, asset_id: "flare_firework", required_level: 3 }
  ]);
  console.log("Default cosmetics seeded");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_settings_history");
  await knex.schema.dropTableIfExists("minigame_progress");
  await knex.schema.dropTableIfExists("user_cosmetics");
  await knex.schema.dropTableIfExists("cosmetics");
  await knex.schema.dropTableIfExists("operation_progress");
  await knex.schema.dropTableIfExists("challenges");
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.schema.dropTableIfExists("users");
};
