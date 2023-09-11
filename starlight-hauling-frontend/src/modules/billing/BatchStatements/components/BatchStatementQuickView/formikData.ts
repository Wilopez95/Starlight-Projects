import { endOfToday, endOfYesterday, isBefore } from 'date-fns';
import * as Yup from 'yup';

import { BatchStatement } from '@root/modules/billing/entities';

import { notNullObject } from '../../../../../helpers';
import { type Maybe } from '../../../../../types';
import { type INewBatchStatement } from '../../types';

const today = endOfToday();
const yesterday = endOfYesterday();

const defaultValue: INewBatchStatement = {
  statementDate: today,
  endDate: yesterday,
  statementIds: [],
  customerIds: [],
};

export const validationSchema = Yup.object().shape({
  endDate: Yup.date().required('End date is required'),
  statementDate: Yup.date()
    .required('Statement date is required')
    .test(
      'statementDate',
      'Statement Date cannot be less than the End Date',
      function (date?: Maybe<Date>) {
        return !!date && !isBefore(date, this.parent.endDate as Date);
      },
    ),
});

export const getValues = (batchstatement: BatchStatement | null): INewBatchStatement => {
  if (!batchstatement) {
    return { ...defaultValue };
  }

  return notNullObject<INewBatchStatement>(batchstatement, defaultValue);
};
