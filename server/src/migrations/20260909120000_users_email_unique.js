exports.up = async function (knex) {
  // Knex runs each migration inside its own transaction (Postgres client
  // default), so this lock is held from here until the ALTER TABLE below
  // commits - closing the window where a concurrent registration could
  // insert a fresh duplicate email between the scan and the constraint
  // being added. SHARE ROW EXCLUSIVE conflicts with the ROW EXCLUSIVE lock
  // any INSERT/UPDATE/DELETE on this table takes, so writers block (and
  // retry) instead of racing past the check.
  await knex.raw("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");

  // The email uniqueness check before this migration only ever ran at the
  // application layer (never a DB constraint), so two concurrent
  // registrations could already have produced duplicate emails on an
  // existing database - failing loudly here with the actual offending rows
  // is far more actionable than letting the ALTER TABLE below fail with a
  // raw Postgres constraint-violation error.
  const duplicateEmails = await knex("users")
    .select("email")
    .count("* as count")
    .groupBy("email")
    .having(knex.raw("count(*) > 1"));
  if (duplicateEmails.length > 0) {
    const emails = duplicateEmails.map((row) => row.email).join(", ");
    throw new Error(
      `Cannot add a unique constraint on users.email - duplicate emails already exist: ${emails}. Reconcile these accounts manually before re-running this migration.`
    );
  }

  await knex.schema.alterTable("users", (table) => {
    table.unique(["email"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropUnique(["email"]);
  });
};
