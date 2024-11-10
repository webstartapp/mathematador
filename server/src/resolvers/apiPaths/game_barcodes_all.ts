import { Igame_barcodes_allCallResolver } from "@/_generated/sessionOperations";
import { MonstersDB } from "@/entities/game/monsters";
import { SfinxDB } from "@/entities/game/sfinx";
import knex from "@/knexWrapper";

const gameBarcodesAll: Igame_barcodes_allCallResolver = async () => {
  const monsters = await MonstersDB.resolvers.getAllMonsters();
  const sfinxes = await SfinxDB.resolvers.getAllSfinxs();
  return {
    endGame: "ijijij",
    items: [],
    mediaTrap: "awsede",
    monsters: (monsters || []).map((monster) => ({
      type: "monster",
      label: monster.title,
      offlineKey: monster.offlineKey,
      identifier: monster.id
    })),
    questBook: "wertbp",
    sfinxes: (sfinxes || []).map((sfinx) => ({
      type: "sfinx",
      label: sfinx.title,
      offlineKey: sfinx.offlineKey,
      identifier: sfinx.id
    }))
  };
};

export default gameBarcodesAll;
