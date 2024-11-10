import knex, { sanateInsertData, unwrappDBJSON } from "@/knexWrapper";
import { ExpressTypeResolver } from "@/resolvers/expressTypeResolver";
import { IGame, IGameItemRequest, IGameRequest } from "@/_generated/sessionOperations";
import { SfinxDB } from "./sfinx";
import { MediaTrapsDB } from "./MediaTraps";
import { MonstersDB } from "./monsters";
import { QuestBooksDB } from "./QuestBooks";

export const GameDB = ExpressTypeResolver({
  table: "games",
  resolvers: {
    getGame: async (props: { gameId: string }): Promise<IGame> => {
      const gameData = await knex("games").where("id", props.gameId).first();
      if (!gameData) throw new Error("Game not found");
      const game = unwrappDBJSON(gameData, [
        "tags",
        "sfinxs",
        "mediaTraps",
        "questBooks",
        "monsters",
        "mediaTrapColorOrder",
        "monsterColorOrder",
        "sfinxColorOrder",
        "questBookColorOrder"
      ]) as IGame;
      if (!game) throw new Error("Game not found");
      const sfinxs = await Promise.all((game.sfinxs || []).map((sfinxId) => SfinxDB.resolvers.getSfinx({ sfinxId })));
      const mediaTraps = await Promise.all(
        (game.mediaTraps || []).map((mediaTrapId) => MediaTrapsDB.resolvers.getMediaTrap({ mediaTrapId }))
      );
      const questBooks = await Promise.all(
        (game.questBooks || []).map((questBookId) => QuestBooksDB.resolvers.getQuestBook({ questBookId }))
      );
      const monsters = await Promise.all(
        (game.monsters || []).map((monsterId) => MonstersDB.resolvers.getMonster({ monsterId }))
      );
      return {
        ...game,
        language: game.language,
        isLongGame: game.isLongGame,
        tags: game.tags,
        id: game.id,
        sfinxs: sfinxs.filter((sfinx) => sfinx !== undefined).map((sfinx) => sfinx.id),
        mediaTraps: mediaTraps.filter((mediaTrap) => mediaTrap !== undefined).map((mediaTrap) => mediaTrap.id),
        questBooks: questBooks.filter((questBook) => questBook !== undefined).map((questBook) => questBook.id),
        monsters: monsters.filter((monster) => monster !== undefined).map((monster) => monster.id),
        mediaTrapColorOrder: game.mediaTrapColorOrder,
        monsterColorOrder: game.monsterColorOrder,
        sfinxColorOrder: game.sfinxColorOrder,
        questBookColorOrder: game.questBookColorOrder
      };
    },
    createGame: async (_props: undefined, body: IGameRequest): Promise<IGame> => {
      const game = await knex("games").insert(sanateInsertData(GameDB, body)).returning("*");
      return GameDB.resolvers.getGame({ gameId: game[0].id });
    },
    updateGame: async (props: { gameId: string }, body: IGameItemRequest): Promise<IGame> => {
      const gameData = await GameDB.resolvers.getGame({ gameId: props.gameId });
      const game = {
        ...gameData,
        mediaTraps: gameData.mediaTraps,
        questBooks: gameData.questBooks,
        monsters: gameData.monsters,
        sfinxs: gameData.sfinxs
      };
      if (!game) throw new Error("Game not found");
      body.remove?.forEach((remove) => {
        const property = remove.property as keyof IGame;
        if (Array.isArray(game[property])) {
          game[property] = game[property]?.filter((id) => id !== remove.id) as never;
        }
      });
      body.insert?.forEach((add) => {
        const property = add.property as keyof IGame;
        if (Array.isArray(game[property])) {
          game[property] = (game[property]?.filter((id) => id !== add.id) as never) || [];
          game[property] = [...game[property], add.id] as never;
        }
      });
      await knex("games").where("id", props.gameId).update(sanateInsertData(GameDB, game));
      return GameDB.resolvers.getGame({ gameId: props.gameId });
    }
  }
});
