import * as Yup from 'yup';

import { Maybe } from '@root/types';

export const getInitialValues = (fromKey: string, toKey: string) => ({
  [fromKey]: undefined,
  [toKey]: undefined,
});

export const generateValidationSchema = (fromKey: string, toKey: string) =>
  Yup.object().shape({
    [fromKey]: Yup.number().positive().required('From number is required'),
    [toKey]: Yup.number()
      .positive()
      .required()
      .test('range', 'Must be greater From number', function (toNumber?: Maybe<number>) {
        if (!this.parent[fromKey]) {
          return true;
        }

        return !!toNumber && toNumber >= this.parent[fromKey];
      }),
  });
