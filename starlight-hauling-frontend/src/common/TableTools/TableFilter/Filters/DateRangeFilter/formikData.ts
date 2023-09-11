import { isBefore } from 'date-fns';
import * as Yup from 'yup';

import { Maybe } from '@root/types';

const minDate = new Date(0);

export const getInitialValues = (fromKey: string, toKey: string) => ({
  [fromKey]: minDate,
  [toKey]: minDate,
});

export const generateValidationSchema = (fromKey: string, toKey: string) =>
  Yup.object().shape({
    [fromKey]: Yup.date().typeError('').required('Date is required'),
    [toKey]: Yup.date()
      .typeError('')
      .required('Date is required')
      .test('endDate', 'End date must be greater that Start date', function (date?: Maybe<Date>) {
        if (!this.parent[fromKey]) {
          return true;
        }
        const fromDate = this.parent[fromKey] as Date;
        return !!date && !isBefore(date, fromDate);
      }),
  });
