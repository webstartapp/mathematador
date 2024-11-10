import { APIResolversType } from "@/_generated/sessionOperations";
import { DBConfig, DBConfigType, IDBType } from "@/types/KnexDBType";
import { Request } from "express";

export type Viewer = {
  id: string;
  roles: string[];
};

export type ContextType = {
  req: Request;
  res: any;
  viewer?: Viewer;
  resolvers: APIResolversType;
  statusSet: boolean;
  setResponseStatus: (status: number) => void;
  responseHeaders: Record<string, string>;
};

export type LocalResolverType<
  ARGS extends Record<string, any> | undefined = Record<string, any> | undefined,
  BODY extends Record<string, any> | undefined = Record<string, any> | undefined,
  RET extends any = any
> = (props: ARGS, body: BODY, context: ContextType) => Promise<RET>;

export type ExpressResolverTypeProps<
  TABLE extends keyof IDBType = keyof IDBType,
  ARGS extends Record<string, any> = any,
  RET extends Record<string, any> = any
> = {
  table: TABLE;
  resolvers: Record<string, LocalResolverType<ARGS, RET>>;
};

export type ExpressResolverType<
  TABLE extends keyof IDBType = keyof IDBType,
  ARGS extends Record<string, any> = any,
  RET extends Record<string, any> = any
> = {
  table: TABLE;
  properties: { [K in keyof IDBType[TABLE]]: K };
  resolvers: Record<string, LocalResolverType<ARGS, RET>>;
};

type ExpressResolverTypeConstructor<TYPE extends ExpressResolverTypeProps> =
  TYPE extends ExpressResolverTypeProps<infer TABLE>
    ? TABLE extends keyof IDBType
      ? { [K in keyof DBConfigType[TABLE]]: K }
      : {}
    : {};

export const ExpressTypeResolver = <
  TABLE extends keyof IDBType = keyof IDBType,
  ARGS extends Record<string, any> = any,
  RET extends Record<string, any> = any,
  TYPE extends ExpressResolverTypeProps<TABLE, ARGS, RET> = ExpressResolverTypeProps<TABLE, ARGS, RET>
>(
  expresResolverOptions: TYPE
): { properties: ExpressResolverTypeConstructor<TYPE> } & TYPE => {
  const respoverProps = DBConfig[expresResolverOptions.table] as ExpressResolverTypeConstructor<TYPE>;
  return {
    ...expresResolverOptions,
    properties: respoverProps
  };
};
