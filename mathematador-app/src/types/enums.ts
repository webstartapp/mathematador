export enum DBReadEnum {
  'all' = 'all',
  'detail' = 'detail',
  'none' = 'none',
}
export enum DBObjectEnum {
  'none' = 'none',
  'object' = 'object',
  'array' = 'array',
}
export enum DBWriteEnum {
  'createOnly' = 'createOnly',
  'any' = 'any',
  'none' = 'none',
}
export enum COREFormInputTypeEnum {
  Input = 'input',
  Select = 'select',
  SelectProvider = 'selectProvider',
  SelectUser = 'selectUser',
  Date = 'date',
  MultiSelect = 'multiselect',
  Submit = 'submit',
  Upload = 'upload',
  Reset = 'reset',
  Separator = 'separator',
  Checkboxes = 'checkboxes',
  Radio = 'radio',
  Preview = 'preview',
}
export type COREFormInputType = `${COREFormInputTypeEnum}`;

/**
 * @description The type of input to be used in the form as defined by the HTML5 standard
 * - the dateTimeSeconds is an extended dateTime-local input with step 1
 * @enum {string}
 * @readonly
 *
 */
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
