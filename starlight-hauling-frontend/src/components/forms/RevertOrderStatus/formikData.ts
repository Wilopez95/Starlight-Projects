import * as Yup from 'yup';

import { RevertableStatus, ScheduledOrInProgress } from '@root/types';

import { type IRevertStatusForm } from './types';

export const validationSchema = Yup.object().shape({
  comment: Yup.string().trim().max(120, 'Please enter up to 120 characters'),
});

export const getDefaultValue = (
  status: RevertableStatus,
  newStatus: ScheduledOrInProgress[],
): IRevertStatusForm => ({
  comment: '',
  ...(status === 'completed' &&
    newStatus?.length && {
      status: newStatus[0],
    }),
});
