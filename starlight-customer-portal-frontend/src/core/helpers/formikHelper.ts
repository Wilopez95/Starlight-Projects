import { FormikErrors } from 'formik';
import { isEmpty, isEqual, omit } from 'lodash-es';

export const getCleanedErrors = <T>(errors: FormikErrors<T>, name: string) => {
  const filteredErrors = omit(errors, name);

  // Remove empty error objects
  // TODO: move recursive checkup to form submit

  let prevErrors;
  let filledErrors = { ...(filteredErrors as FormikErrors<T>) };

  while (!isEqual(prevErrors, filledErrors)) {
    prevErrors = filledErrors;
    filledErrors = removeEmptyValues(filledErrors);
  }

  return filledErrors;
};

export const removeEmptyValues = <T>(obj: FormikErrors<T>): FormikErrors<T> => {
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([, value]) => !isEmpty(value))
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: removeEmptyValues(value as FormikErrors<T>) }),
        {},
      );
  }

  return obj;
};
