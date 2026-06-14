import { Knex } from "knex";

export interface UserRow {
  id: string;
  created: Date;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface SubscriptionRow {
  id: string;
  created: Date;
  user_id: string;
  type: string;
  auto_renew: boolean;
}

export interface ChallengeRow {
  id: string;
  created: Date;
  user_id: string;
  operation_id: string;
  minigame: string;
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

export type IDBType = {
  users: UserRow;
  subscriptions: SubscriptionRow;
  challenges: ChallengeRow;
  operation_progress: OperationProgressRow;
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
