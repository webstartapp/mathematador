exports.up = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("password").nullable().alter();
    table.string("google_id").unique().nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("google_id");
    table.string("password").notNullable().alter();
  });
};
