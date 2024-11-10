import {
  COREInputType,
  CORESelectType,
  // eslint-disable-next-line import/no-unresolved
} from '@/types/RestAPIGenerator/COREInputType';
// eslint-disable-next-line import/no-unresolved
import { COREFormInputTypeEnum } from '@/types/enums';

export type COREFormFieldType<T = any> = COREInputType<
  T,
  Extract<keyof T, string>
> &
  CORESelectType & {
    input?: COREFormInputTypeEnum;
    custom?: JSX.Element;
    preview?: boolean;
    hidden?: boolean;
  };
