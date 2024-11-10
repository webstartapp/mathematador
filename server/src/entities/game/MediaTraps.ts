import { IMediaTrap, IMediaTrapRequest } from "@/_generated/sessionOperations";
import knex, { sanateInsertData, unwrappDBJSON } from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";
import { GameDB } from "./game";

export const MediaTrapsDB = ExpressTypeResolver({
  table: "media_traps",
  resolvers: {
    getMediaTrap: async (props: { mediaTrapId: string }) => {
      const mediaTrap = await knex("media_traps").where("id", props.mediaTrapId).first();
      return mediaTrap;
    },
    createMediaTrap: async (_props: undefined, body: IMediaTrapRequest): Promise<IMediaTrap> => {
      const mediaTrap = await knex("media_traps").insert(sanateInsertData(MediaTrapsDB, body)).returning("*");
      return knex("media_traps").where("id", mediaTrap[0].id).first() as unknown as IMediaTrap;
    },
    updateMediaTrap: async (props: { mediaTrapId: string }, body: IMediaTrapRequest) => {
      await knex("media_traps")
        .where("id", props.mediaTrapId)
        .update(sanateInsertData(MediaTrapsDB, [body])[0]);
      return knex("media_traps").where("id", props.mediaTrapId).first();
    },
    updateMediaTrapsBulk: async (_props: undefined, body: IMediaTrap[]): Promise<IMediaTrap[]> => {
      await Promise.all(
        sanateInsertData(MediaTrapsDB, body).map(async (mediaTrap) => {
          const cleanMediaTrap = { ...mediaTrap } as any;
          delete cleanMediaTrap.created;
          delete cleanMediaTrap.id;
          return await MediaTrapsDB.resolvers.updateMediaTrap({ mediaTrapId: mediaTrap.id }, cleanMediaTrap);
        })
      );
      return MediaTrapsDB.resolvers.getAllMediaTraps({});
    },
    deleteMediaTrap: async (props: { mediaTrapId: string }) => {
      await knex("media_traps").where("id", props.mediaTrapId).del();
      return "MediaTrap deleted";
    },
    getAllMediaTraps: async (props: { active?: boolean }): Promise<Required<IMediaTrap>[]> => {
      const allMediaTraps = await knex("media_traps").select("*");
      if (props.active === true || props.active === false) {
        return unwrappDBJSON(
          allMediaTraps.filter((item) => item.active === props.active),
          ["tags"]
        );
      }
      return unwrappDBJSON(allMediaTraps, ["tags"]) as Required<IMediaTrap>[];
    },
    getRandomMediaTrap: async (props: { gameId: string }) => {
      const gameData = await GameDB.resolvers.getGame(props);
      const collectedMediaTrapIds = gameData.mediaTraps;
      const tags = gameData.tags;

      const all = (await MediaTrapsDB.resolvers.getAllMediaTraps({ active: true })) as Required<IMediaTrap>[];
      // sort items randomly
      const sorted = all.sort(() => Math.random() - 0.5);
      const filtered = sorted.find(
        (mediaTrap) =>
          !collectedMediaTrapIds.includes(mediaTrap.id) && mediaTrap.tags.some((tag: string) => tags.includes(tag))
      );
      if (filtered) {
        return filtered;
      }
      const tagged = sorted.find((mediaTrap) => mediaTrap.tags.some((tag: string) => tags.includes(tag)));
      if (tagged) {
        return tagged;
      }
      return sorted[0] || {};
    }
  }
});
