import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  // 1. Create cosmetics table
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

  // 2. Create user_cosmetics table
  await knex.schema.createTable("user_cosmetics", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.uuid("cosmetic_id").references("id").inTable("cosmetics").onDelete("CASCADE").notNullable();
    table.string("cosmetic_type").notNullable(); // "cape" | "suit" | "flare"
    table.boolean("equipped").notNullable().defaultTo(false);
    table.unique(["user_id", "cosmetic_id"]);
  });
  // Create a partial unique index so that a user can only have one cosmetic of each type equipped at a time
  await knex.raw(
    "CREATE UNIQUE INDEX user_cosmetics_equipped_unique ON user_cosmetics(user_id, cosmetic_type) WHERE equipped = true"
  );
  console.log("User cosmetics table created with partial unique index for equipped status");

  // 3. Create minigame_progress table
  await knex.schema.createTable("minigame_progress", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("minigame_id").notNullable(); // "SingleLineMinigame" | "dragAndDrop" | "crossNumbers" | "memory"
    table.integer("level").notNullable().defaultTo(1);
    table.integer("xp").notNullable().defaultTo(0);
    table.unique(["user_id", "minigame_id"]);
  });
  console.log("Minigame progress table created");

  // 4. Seed default cosmetics
  await knex("cosmetics").insert([
    {
      name: "Fibonacci Spiral Cape",
      type: "cape",
      price: 100,
      asset_id: "cape_fibonacci",
      required_level: 1
    },
    {
      name: "Golden Pi Cape",
      type: "cape",
      price: 300,
      asset_id: "cape_pi",
      required_level: 3
    },
    {
      name: "Matrix Code Suit",
      type: "suit",
      price: 200,
      asset_id: "suit_matrix",
      required_level: 2
    },
    {
      name: "Neon Sparkle Suit",
      type: "suit",
      price: 500,
      asset_id: "suit_neon",
      required_level: 4
    },
    {
      name: "Golden Flare",
      type: "flare",
      price: 150,
      asset_id: "flare_golden",
      required_level: 1
    },
    {
      name: "Sparkling Firework Flare",
      type: "flare",
      price: 350,
      asset_id: "flare_firework",
      required_level: 3
    }
  ]);
  console.log("Default cosmetics seeded");
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists("minigame_progress");
  await knex.schema.dropTableIfExists("user_cosmetics");
  await knex.schema.dropTableIfExists("cosmetics");
};
