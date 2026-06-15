const bcrypt = require("bcryptjs");

exports.up = async function (knex) {
  // Enable UUID extension if not exists
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // 1. Create users table
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.string("username").notNullable().unique();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.string("role").notNullable().defaultTo("user");
  });
  console.log("Users table created");

  // 2. Create subscriptions table
  await knex.schema.createTable("subscriptions", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("type").notNullable(); // "addsFree" or "full"
    table.boolean("auto_renew").notNullable().defaultTo(true);
  });
  console.log("Subscriptions table created");

  // 3. Create challenges table
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

  // 4. Create operation_progress table
  await knex.schema.createTable("operation_progress", (table) => {
    table.uuid("id").primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("created").defaultTo(knex.fn.now());
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
    table.string("operation_id").notNullable(); // "addition", "subtraction", "multiplication", "division"
    table.integer("level").notNullable().defaultTo(1);
    table.integer("xp").notNullable().defaultTo(0);
    // Unique constraint on (user_id, operation_id) to prevent duplicate tracks
    table.unique(["user_id", "operation_id"]);
  });
  console.log("Operation progress table created");

  // Create a default root admin user
  const salt = await bcrypt.genSalt(10);
  const rootPasswordHash = await bcrypt.hash("cestapoznani", salt);
  await knex("users").insert({
    username: "root",
    password: rootPasswordHash,
    email: "root@example.com",
    role: "admin"
  });
  console.log("Root user created");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("operation_progress");
  await knex.schema.dropTableIfExists("challenges");
  await knex.schema.dropTableIfExists("subscriptions");
  await knex.schema.dropTableIfExists("users");
};
