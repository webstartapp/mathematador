import { COREInputType, CORESelectType } from "@/types/RestAPIGenerator/COREInputType";
import { COREFormInputTypeEnum } from "@/types/enums";

export type COREFormFieldType<T = any> = COREInputType<T, Extract<keyof T, string>> &
  CORESelectType & {
    input?: COREFormInputTypeEnum;
    preview?: boolean;
    hidden?: boolean;
  };
