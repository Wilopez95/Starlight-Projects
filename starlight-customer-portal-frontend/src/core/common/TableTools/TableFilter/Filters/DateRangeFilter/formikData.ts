import { isAfter, subDays } from 'date-fns';
import * as Yup from 'yup';

import { Maybe } from '@root/core/types';

export const getInitialValues = (fromKey: string, toKey: string) => ({
  [fromKey]: subDays(new Date(), 7),
  [toKey]: new Date(),
});

export const generateValidationSchema = (fromKey: string, toKey: string) =>
  Yup.object().shape({
    [fromKey]: Yup.date().typeError('').required(),
    [toKey]: Yup.date()
      .typeError('')
      .required()
      .test('endDate', ' ', function (date?: Maybe<Date>) {
        if (!this.parent.filterByServiceDateFrom || !date) {
          return true;
        }

        return isAfter(date, this.parent.filterByServiceDateFrom);
      }),
  });
