import {
  IGame,
  IMediaTrap,
  IMonster,
  IQuestBook,
  IQuestBookItem,
  ISfinx,
  IUserRoles
} from "@/_generated/sessionOperations";
import { Knex } from "knex";
type DBCOnfigItem<T extends string[]> = {
  [K in T[number]]: K;
};
type DBConfigEntryItem<T extends string[]> = T;
const DBTypeFN = <
  KEY extends string,
  CONF extends {
    [K in KEY]: DBConfigEntryItem<string[]>;
  }
>(
  DBConfigData: CONF
): {
  [K in keyof CONF]: DBCOnfigItem<CONF[K]>;
} => {
  const out = {} as {
    [K in keyof CONF]: DBCOnfigItem<CONF[K]>;
  };
  Object.keys(DBConfigData).forEach((key) => {
    const keyName = key as keyof CONF;
    out[keyName] = {} as DBCOnfigItem<CONF[keyof CONF]>;
    DBConfigData[keyName].forEach((item) => {
      const itemKey = item as keyof DBCOnfigItem<CONF[keyof CONF]>;
      out[keyName][itemKey] = item;
    });
  });
  return out;
};

export const DBConfig = DBTypeFN({
  users: ["id", "created", "username", "email", "password", "role"],
  games: [
    "tags",
    "isLongGame",
    "language",
    "id",
    "mediaTraps",
    "sfinxs",
    "questBooks",
    "monsters",
    "created",
    "completed",
    "mediaTrapColorOrder",
    "monsterColorOrder",
    "sfinxColorOrder",
    "questBookColorOrder"
  ],
  media_traps: ["id", "title", "isTrue", "tags", "created", "media", "question", "active"],
  sfinxs: ["id", "title", "question", "answers", "created", "tags", "active", "picture", "offlineKey", "correctAnswer"],
  sfinx_answers: ["id", "title", "created", "sfinxId"],
  quest_books: ["id", "title", "question", "created", "tags", "answer1", "answer2", "active"],
  monsters: ["id", "title", "description", "created", "awarensess", "offlineKey", "image", "active"],
  tags: ["id", "name", "created", "active", "icon"]
} as const);

export type DBConfigType = typeof DBConfig;

type ExtendDBType<
  EXT extends {
    [K in keyof DBConfigType]?: {
      [L in keyof DBConfigType[K]]?: any;
    };
  }
> = {
  [K in keyof DBConfigType]: EXT[K] extends undefined
    ? {
        [L in keyof DBConfigType[K]]: string;
      }
    : {
        [L in keyof DBConfigType[K]]: L extends keyof EXT[K]
          ? EXT[K][L] extends undefined
            ? string
            : EXT[K][L]
          : string;
      };
};

export type IDBType = ExtendDBType<{
  users: {
    role: IUserRoles;
  };
  games: {
    completed: boolean;
    created: number;
    isLongGame: boolean;
    mediaTraps: string[];
    monsters: string[];
    questBooks: string[];
    sfinxs: string[];
    tags: string[];
    mediaTrapColorOrder: string[];
    monsterColorOrder: string[];
    sfinxColorOrder: string[];
    questBookColorOrder: string[];
  };
  media_traps: IMediaTrap;
  sfinxs: ISfinx;
  monsters: IMonster;
  quest_books: IQuestBook;
  tags: {
    created: number;
    active: boolean;
  };
  sfinx_answers: {
    created: number;
  };
}>;

declare module "knex/types/tables" {
  interface Tables extends IDBType {}
}

export type KnexMigrateType<T extends keyof IDBType> = Knex<IDBType[T], IDBType[T][]>;
export type KnexMigrateTableType<T extends keyof IDBType> = KnexMigrateType<T>["table"];
