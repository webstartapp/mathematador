require("tsconfig-paths/register");
import { GameDB } from "@/entities/game/game";
import { UserDB } from "@/entities/user/user";
import { QuestBooksDB } from "@/entities/game/QuestBooks";
import { SfinxDB } from "@/entities/game/sfinx";
import { MediaTrapsDB } from "@/entities/game/MediaTraps";
import { MonstersDB } from "@/entities/game/monsters";
import { KnexMigrateType } from "@/types/KnexDBType";
import type { Knex } from "knex";
import { hashPassword } from "@/utils/password";
import { IUserRoles } from "@/_generated/sessionOperations";
import { TagsDB } from "@/entities/tags";

const upUser = async (knex: KnexMigrateType<"users">) => {
  await knex.schema.createTable(UserDB.table, (table) => {
    console.log({
      ...UserDB.properties
    });
    table.uuid(UserDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(UserDB.properties.created).defaultTo(knex.fn.now());
    table.string(UserDB.properties.username);
    table.string(UserDB.properties.email);
    table.string(UserDB.properties.password);
    table.string(UserDB.properties.role);
  });
  console.log("User table created");
  return;
};

const upGame = async (knex: KnexMigrateType<"games">) => {
  await knex.schema.createTable(GameDB.table, (table) => {
    table.uuid(GameDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(GameDB.properties.created).defaultTo(knex.fn.now());
    table.boolean(GameDB.properties.completed);
    table.boolean(GameDB.properties.isLongGame);
    table.string(GameDB.properties.language);
    table.jsonb(GameDB.properties.sfinxs);
    table.jsonb(GameDB.properties.mediaTraps);
    table.jsonb(GameDB.properties.questBooks);
    table.jsonb(GameDB.properties.monsters);
    table.jsonb(GameDB.properties.tags);
    table.jsonb(GameDB.properties.mediaTrapColorOrder);
    table.jsonb(GameDB.properties.monsterColorOrder);
    table.jsonb(GameDB.properties.sfinxColorOrder);
    table.jsonb(GameDB.properties.questBookColorOrder);
  });
  console.log("Game table created");
  return;
};

const upTags = async (knex: KnexMigrateType<"tags">) => {
  await knex.schema.createTable(TagsDB.table, (table) => {
    table.uuid(TagsDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(TagsDB.properties.created).defaultTo(knex.fn.now());
    table.string(TagsDB.properties.name);
    table.boolean(TagsDB.properties.active);
    table.text(TagsDB.properties.icon);
  });
  console.log("Tags table created");
  return;
};

const upSfinx = async (knex: KnexMigrateType<"sfinxs">) => {
  await knex.schema.createTable(SfinxDB.table, (table) => {
    table.uuid(SfinxDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(SfinxDB.properties.created).defaultTo(knex.fn.now());
    table.text(SfinxDB.properties.answers);
    table.text(SfinxDB.properties.correctAnswer);
    table.string(SfinxDB.properties.question);
    table.string(SfinxDB.properties.title);
    table.text(SfinxDB.properties.picture);
    table.jsonb(SfinxDB.properties.tags);
    table.string(SfinxDB.properties.offlineKey);
    table.boolean(SfinxDB.properties.active).defaultTo(false);
  });
  console.log("Sfinx table created");
  return;
};

const upMediaTraps = async (knex: KnexMigrateType<"media_traps">) => {
  await knex.schema.createTable(MediaTrapsDB.table, (table) => {
    table.uuid(MediaTrapsDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(MediaTrapsDB.properties.created).defaultTo(knex.fn.now());
    table.string(MediaTrapsDB.properties.title);
    table.boolean(MediaTrapsDB.properties.isTrue);
    table.text(MediaTrapsDB.properties.media);
    table.string(MediaTrapsDB.properties.question);
    table.jsonb(MediaTrapsDB.properties.tags);
    table.boolean(MediaTrapsDB.properties.active).defaultTo(false);
  });
  console.log("MediaTraps table created");
  return;
};

const upMonsters = async (knex: KnexMigrateType<"monsters">) => {
  await knex.schema.createTable(MonstersDB.table, (table) => {
    table.uuid(MonstersDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(MonstersDB.properties.created).defaultTo(knex.fn.now());
    table.string(MonstersDB.properties.title);
    table.string(MonstersDB.properties.description);
    table.text(MonstersDB.properties.image);
    table.integer(MonstersDB.properties.awarensess);
    table.string(MonstersDB.properties.offlineKey);
    table.boolean(MonstersDB.properties.active).defaultTo(false);
  });
  console.log("Monsters table created");
  return;
};

const upQuestBooks = async (knex: KnexMigrateType<"quest_books">) => {
  await knex.schema.createTable(QuestBooksDB.table, (table) => {
    table.uuid(QuestBooksDB.properties.id).primary().notNullable().defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp(QuestBooksDB.properties.created).defaultTo(knex.fn.now());
    table.string(QuestBooksDB.properties.title);
    table.string(QuestBooksDB.properties.question);
    table.jsonb(QuestBooksDB.properties.answer1);
    table.jsonb(QuestBooksDB.properties.answer2);
    table.jsonb(QuestBooksDB.properties.tags);
    table.boolean(QuestBooksDB.properties.active).defaultTo(false);
  });
  console.log("QuestBooks table created");
  return;
};

export async function up(
  knex: KnexMigrateType<"games" | "users" | "sfinxs" | "media_traps" | "monsters" | "quest_books" | "tags">
): Promise<void> {
  console.log(UserDB);
  await upUser(knex as KnexMigrateType<"users">);
  await upGame(knex as KnexMigrateType<"games">);
  await upSfinx(knex as KnexMigrateType<"sfinxs">);
  await upMediaTraps(knex as KnexMigrateType<"media_traps">);
  await upMonsters(knex as KnexMigrateType<"monsters">);
  await upQuestBooks(knex as KnexMigrateType<"quest_books">);
  await upTags(knex as KnexMigrateType<"tags">);
  const rootPasswordHash = await hashPassword("cestapoznani");
  await knex("users").insert({
    username: "root",
    password: rootPasswordHash,
    email: "",
    role: IUserRoles.Admin
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(UserDB.table);
  await knex.schema.dropTable(GameDB.table);
  await knex.schema.dropTable(SfinxDB.table);
  await knex.schema.dropTable(MediaTrapsDB.table);
  await knex.schema.dropTable(MonstersDB.table);
  await knex.schema.dropTable(QuestBooksDB.table);
  await knex.schema.dropTable(TagsDB.table);
}
