/* eslint-disable @typescript-eslint/no-explicit-any */
import { COREFormInputTypeEnum } from "@/types/enums";
import { COREInputType, CORESelectType } from "@/types/RestAPIGenerator/COREInputType";

export type COREFormFieldType<T = any> = COREInputType<T, Extract<keyof T, string>> &
  CORESelectType & {
    input?: COREFormInputTypeEnum;
    preview?: boolean;
    hidden?: boolean;
  };
