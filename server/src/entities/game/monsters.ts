import { IMonster, IMonsterRequest } from "@/_generated/sessionOperations";
import knex from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";

export const MonstersDB = ExpressTypeResolver({
  table: "monsters",
  resolvers: {
    getMonster: async (props: { monsterId: string }) => {
      const monster = await knex("monsters").where("id", props.monsterId).first();
      return monster;
    },
    createMonster: async (_props: undefined, body: IMonsterRequest) => {
      const monster = await knex("monsters").insert(body).returning("*");
      return knex("monsters").where("id", monster[0].id).first();
    },
    updateMonster: async (props: { monsterId: string }, body: IMonsterRequest) => {
      await knex("monsters").where("id", props.monsterId).update(body);
      return knex("monsters").where("id", props.monsterId).first();
    },
    updateMonstersBulk: async (_props: undefined, body: IMonster[]): Promise<IMonster[]> => {
      await Promise.all(
        body.map(async (monster) => {
          const cleanMonster = { ...monster } as any;
          delete cleanMonster.created;
          delete cleanMonster.id;
          return await MonstersDB.resolvers.updateMonster({ monsterId: monster.id }, cleanMonster);
        })
      );
      return MonstersDB.resolvers.getAllMonsters();
    },
    deleteMonster: async (props: { monsterId: string }) => {
      await knex("monsters").where("id", props.monsterId).del();
      return "Monster deleted";
    },
    getAllMonsters: async (): Promise<Required<IMonster>[]> => {
      return (await knex("monsters").select("*")) as Required<IMonster>[];
    }
  }
});
