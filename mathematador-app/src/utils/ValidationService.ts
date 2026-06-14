import * as yupValidator from "yup";
import { ObjectShape } from "yup";

// yupValidator.setLocale({
//   mixed: {
//     notType: ({ type, originalValue, path }: any) => {
//       // Customize error messages based on type
//       if (type === 'date') return `Field ${path} has to be in Date format yyyy-mm-dd`;
//       if (type === 'number') return `Field ${path} has to be a number`;
//       if (!originalValue) return `${path} is required`;
//       return `Incorrect format of ${path}`;
//     },
//     required: ({ path }) => `${path} is required`,
//   },
//   string: {
//     email: 'Incorrect email',
//     min: ({ min }) => `Length should be at least ${min} characters`,
//     max: ({ max }) => `Length should be less than ${max} characters`,
//   },
//   number: {
//     min: ({ min }) => `The minimum is ${min}`,
//     integer: 'Should be an integer',
//     min: ({ min }) => `Date should not be before ${min}`,
//     max: ({ max }) => `Date should not be after ${max}`,
//   },
// });

export const validateData = (
  validationSchema?: ObjectShape,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> = {},
  dataName?: string,
): Record<string, string> | undefined => {
  if (!validationSchema) return undefined;
  const validateWith = dataName
    ? { [dataName]: validationSchema[dataName] }
    : validationSchema;
  try {
    yupValidator
      .object()
      .shape(validateWith)
      .validateSync(data, { abortEarly: false });
    return undefined;
  } catch (error) {
    if (error instanceof yupValidator.ValidationError) {
      const errorOut: Record<string, string> = {};
      error.inner.forEach((errorItem) => {
        if (errorItem.path) {
          errorOut[errorItem.path] = errorItem.message;
        }
      });
      return errorOut;
    }
    return { global: error instanceof Error ? error.message : String(error) };
  }
};

export default yupValidator;
