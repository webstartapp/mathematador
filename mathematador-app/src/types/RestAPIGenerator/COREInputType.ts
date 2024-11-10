export enum COREInputTypeEnum {
  text = 'text',
  password = 'password',
  date = 'date',
  dateTime = 'datetime-local',
  dateTimeSeconds = 'datetime-seconds',
  time = 'time',
  number = 'number',
  email = 'email',
  binary = 'file',
}

export type COREInputType<T = any, ID extends keyof T = any> = {
  id: ID | `custom-${string}`;
  label?: string | JSX.Element;
  selected?: boolean;
  onChange?: ({
    value,
    e,
  }: {
    value: string | string[];
    e?: React.ChangeEvent;
  }) => void;
  onFocus?: React.FocusEventHandler;
  type?: COREInputTypeEnum;
  tooltip?: string;
  maxLength?: number;
  disabled?: boolean;
};

export type CORESelectOptionsType = {
  label?: string;
  value: string | number | boolean;
  negative?: string | number | boolean;
};

// eslint-disable-next-line no-use-before-define
export type CORESelectOnFilter = (filetrData: {
  value: string;
  field: CORESelectType;
}) => void;

export type CORESelectType<
  T = any,
  ID extends keyof T = keyof T,
> = COREInputType<T, ID> & {
  onFilter?: CORESelectOnFilter;
  options?: CORESelectOptionsType[];
  loading?: boolean;
  resetId?: number;
  multi?: boolean;
};
