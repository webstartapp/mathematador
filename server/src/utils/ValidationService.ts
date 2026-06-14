import * as yupValidator from "yup";
import { ObjectShape } from "yup";

yupValidator.setLocale({
  mixed: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notType: ({ type, originalValue, path }: { type: string; originalValue: any; path: string }): string => {
      // value, path,
      /*
            {value: null, originalValue: null, label: undefined, path: 'readme', type: 'string'}
            */
      if (type === "date") return `Field ${path} has to be in Date format yyyy-mm-dd`;
      if (type === "number") return `Field ${path} has to be number`;
      if (!originalValue) return `${path} is required`;
      return `Incorrect format of ${path}`;
    },
    required: ({ path }: { path: string }): string => `${path} is as required`
  },
  string: {
    email: "Incorrect email",
    min: ({ min }: { min: number }): string => `Lenght should be at least ${min} chracters`,
    max: ({ max }: { max: number }): string => `Lenght should be less than ${max} chracters`
  },
  number: {
    min: ({ min }: { min: number }): string => `The minimum is ${min}`,
    integer: "Should be inteeger"
  },
  date: {
    min: ({ min }: { min: Date | string | number }): string => `Date should be not before ${min}`,
    max: ({ max }: { max: Date | string | number }): string => `Date should be not after ${max}`
  }
});
export const validateData = async (
  validationSchema?: ObjectShape,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> = {},
  dataName?: string
): Promise<string | undefined> => {
  if (!validationSchema) return undefined;
  const validateWith = dataName ? { [dataName]: validationSchema[dataName] } : validationSchema;
  try {
    await yupValidator.object().shape(validateWith).validate(data);
    return undefined;
  } catch (error) {
    if (error instanceof yupValidator.ValidationError) {
      return error.message;
    }
    return error instanceof Error ? error.message : String(error);
  }
};
export default yupValidator;
