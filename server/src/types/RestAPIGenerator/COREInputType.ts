export enum COREInputTypeEnum {
  text = "text",
  password = "password",
  date = "date",
  dateTime = "datetime-local",
  dateTimeSeconds = "datetime-seconds",
  time = "time",
  number = "number",
  email = "email",
  binary = "file"
}

export type COREInputType<T = any, ID extends keyof T = any> = {
  id: ID | `custom-${string}`;
  label?: string;
  selected?: boolean;
  onChange?: ({ value, e }: { value: string | Array<string>; e?: () => void }) => void;
  onFocus?: () => void;
  type?: COREInputTypeEnum;
  formId?: string;
  tooltip?: string;
  maxLength?: number;
  disabled?: boolean;
  translationPrefix?: string;
};

export type CORESelectOptionsType = {
  label?: string;
  value: string | number | boolean;
  negative?: string | number | boolean;
};

// eslint-disable-next-line no-use-before-define
export type CORESelectOnFilter = (filetrData: { value: string; field: CORESelectType }) => void;

export type CORESelectType<T = any, ID extends keyof T = keyof T> = COREInputType<T, ID> & {
  onFilter?: CORESelectOnFilter;
  options?: Array<CORESelectOptionsType>;
  loading?: boolean;
  resetId?: number;
  multi?: boolean;
};
