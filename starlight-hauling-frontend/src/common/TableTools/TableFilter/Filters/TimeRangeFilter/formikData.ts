import { endOfDay, isBefore, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import { Maybe } from '@root/types';

const today = new Date();

export const getInitialValues = (fromKey: string, toKey: string) => ({
  [fromKey]: startOfDay(today),
  [toKey]: endOfDay(today),
});

export const generateValidationSchema = (fromKey: string, toKey: string) =>
  Yup.object().shape({
    [fromKey]: Yup.date().required('Start time is required'),
    [toKey]: Yup.date()
      .required('End time is required')
      .test('endTime', 'End time must be greater than Start time', function (date?: Maybe<Date>) {
        if (!this.parent[fromKey]) {
          return true;
        }

        return !!date && !isBefore(date, this.parent[fromKey] as Date);
      }),
  });
