import { Knex } from "knex";

export interface UserRow {
  id: string;
  created: Date;
  username: string;
  email: string;
  password: string;
  role: string;
}
import { OperationId, Minigame, SubscriptionType } from "@/_generated/model";

export interface SubscriptionRow {
  id: string;
  created: Date;
  user_id: string;
  type: SubscriptionType;
  auto_renew: boolean;
}

export interface ChallengeRow {
  id: string;
  created: Date;
  user_id: string;
  operation_id: OperationId;
  minigame: Minigame;
  exercises: string;
  result: string | null;
  completed: boolean;
}

export interface OperationProgressRow {
  id: string;
  created: Date;
  user_id: string;
  operation_id: string;
  level: number;
  xp: number;
}

export interface CosmeticRow {
  id: string;
  created: Date;
  name: string;
  type: string;
  price: number;
  asset_id: string;
  required_level: number;
}

export interface UserCosmeticRow {
  id: string;
  created: Date;
  user_id: string;
  cosmetic_id: string;
  cosmetic_type: string;
  equipped: boolean;
}

export interface MinigameProgressRow {
  id: string;
  created: Date;
  user_id: string;
  minigame_id: Minigame;
  level: number;
  xp: number;
}

export type IDBType = {
  users: UserRow;
  subscriptions: SubscriptionRow;
  challenges: ChallengeRow;
  operation_progress: OperationProgressRow;
  cosmetics: CosmeticRow;
  user_cosmetics: UserCosmeticRow;
  minigame_progress: MinigameProgressRow;
};

// Minimal DBConfig placeholder for legacy expressTypeResolver.ts to compile
export const DBConfig: Record<string, string[]> = {
  users: ["id", "created", "username", "email", "password", "role"]
};

export type DBConfigType = typeof DBConfig;

declare module "knex/types/tables" {
  interface Tables extends IDBType {}
}

export type KnexMigrateType<T extends keyof IDBType> = Knex<IDBType[T], IDBType[T][]>;
export type KnexMigrateTableType<T extends keyof IDBType> = KnexMigrateType<T>["table"];
