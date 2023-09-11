import { FormikErrors } from 'formik';
import { set } from 'lodash-es';

import { ResponseError } from '@root/api/base';

export const getFormikErrors = <T>(response: ResponseError): FormikErrors<T> => {
  const errors = {};

  response.details?.forEach(details => {
    set(errors, details.path, details.message);
  });

  return errors;
};
