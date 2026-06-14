import * as zod from "zod";

declare module "zod" {
  export function email(params?: any): zod.ZodString;
  export function uuid(params?: any): zod.ZodString;
}
