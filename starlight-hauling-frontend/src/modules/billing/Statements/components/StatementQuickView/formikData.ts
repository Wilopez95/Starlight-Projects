import { endOfYesterday, isBefore } from 'date-fns';
import * as Yup from 'yup';

import { notNullObject } from '../../../../../helpers';
import { Maybe } from '../../../../../types';
import { type Statement } from '../../store/Statement';
import { type INewStatement } from '../../types';

const yesterday = endOfYesterday();

const defaultValue: INewStatement = {
  statementDate: undefined,
  endDate: yesterday,
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

export const getValues = (statement: Statement | null): INewStatement => {
  if (!statement) {
    return { ...defaultValue };
  }

  return notNullObject<INewStatement>(statement, defaultValue);
};
