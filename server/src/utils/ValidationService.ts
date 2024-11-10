import * as yup from "yup";
import { ObjectShape } from "yup";

yup.setLocale({
  mixed: {
    notType: ({ type, originalValue, path }: any) => {
      // value, path,
      /*
            {value: null, originalValue: null, label: undefined, path: 'readme', type: 'string'}
            */
      if (type === "date") return `Field ${path} has to be in Date format yyyy-mm-dd`;
      if (type === "number") return `Field ${path} has to be number`;
      if (!originalValue) return `${path} is required`;
      return `Incorrect format of ${path}`;
    },
    required: ({ path }) => `${path} is as required`
  },
  string: {
    email: "Incorrect email",
    min: ({ min }) => `Lenght should be at least ${min} chracters`,
    max: ({ max }) => `Lenght should be less than ${max} chracters`
  },
  number: {
    min: ({ min }) => `The minimum is ${min}`,
    integer: "Should be inteeger"
  },
  date: {
    min: ({ min }) => `Date should be not before ${min}`,
    max: ({ max }) => `Date should be not after ${max}`
  }
});
export const validateData = async (
  validationSchema?: ObjectShape,
  data: any = {},
  dataName?: string
): Promise<string | undefined> => {
  if (!validationSchema) return undefined;
  const validateWith = dataName ? { [dataName]: validationSchema[dataName] } : validationSchema;
  try {
    await yup.object().shape(validateWith).validate(data);
    return undefined;
  } catch (e: any) {
    return e.message;
  }
};
export default yup;
