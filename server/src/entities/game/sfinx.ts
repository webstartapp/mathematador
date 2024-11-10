import { ISfinx, ISfinxRequest } from "@/_generated/sessionOperations";
import knex, { sanateInsertData, unwrappDBJSON } from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";

export const SfinxDB = ExpressTypeResolver({
  table: "sfinxs",
  resolvers: {
    getSfinx: async (props: { sfinxId: string }) => {
      const sfinx = await knex("sfinxs").where("id", props.sfinxId).first();
      return sfinx;
    },
    createSfinx: async (_props: undefined, body: ISfinxRequest): Promise<ISfinx> => {
      const sfinx = await knex("sfinxs")
        .insert(sanateInsertData(SfinxDB, [body])[0])
        .returning("*");
      return knex("sfinxs").where("id", sfinx[0].id).first() as Promise<ISfinx>;
    },
    updateSfinx: async (props: { sfinxId: string }, body: ISfinxRequest): Promise<ISfinx> => {
      await knex("sfinxs")
        .where("id", props.sfinxId)
        .update(sanateInsertData(SfinxDB, [body])[0]);
      return knex("sfinxs").where("id", props.sfinxId).first() as Promise<ISfinx>;
    },
    updateSfinxsBulk: async (_props: undefined, body: ISfinx[]): Promise<ISfinx[]> => {
      await Promise.all(
        sanateInsertData(SfinxDB, body).map(async (sfinx) => {
          const cleanSfinx = { ...sfinx } as any;
          delete cleanSfinx.created;
          delete cleanSfinx.id;
          return await SfinxDB.resolvers.updateSfinx({ sfinxId: sfinx.id }, cleanSfinx);
        })
      );
      return SfinxDB.resolvers.getAllSfinxs();
    },
    deleteSfinx: async (props: { sfinxId: string }) => {
      await knex("sfinxs").where("id", props.sfinxId).del();
      return "Sfinx deleted";
    },
    getAllSfinxs: async (): Promise<Required<ISfinx>[]> => {
      const allSfinxes = await knex("sfinxs").select("*");
      return unwrappDBJSON(allSfinxes, ["tags", "answers"]) as Required<ISfinx>[];
    },
    getRandomSfinx: async (props: { collectedSfinxIds: string[]; tags: string[] }) => {
      const all = (await SfinxDB.resolvers.getAllSfinxs()) as Required<ISfinx>[];
      const filtered = all.filter(
        (sfinx) =>
          !props.collectedSfinxIds.includes(sfinx.id) && sfinx.tags.some((tag: string) => props.tags.includes(tag))
      );
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
});
