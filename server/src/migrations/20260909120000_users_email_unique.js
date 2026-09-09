exports.up = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.unique(["email"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropUnique(["email"]);
  });
};
