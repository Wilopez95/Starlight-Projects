import * as Yup from 'yup';

import { IFrequency } from '@root/types';

import { IFrequencyFormData } from './types';

export const validationSchema = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  everyXDaysTimes: Yup.number().when('type', {
    is: 'everyXDays',
    then: Yup.number()
      .integer('Number must be integer')
      .max(100, 'Number cannot be more than 100')
      .min(1, 'Number must be greater than zero')
      .required('Number is required'),
  }),
  xPerWeekTimes: Yup.number().when('type', {
    is: 'xPerWeek',
    then: Yup.number()
      .integer('Number must be integer')
      .max(7, 'Number cannot be more than 7')
      .min(1, 'Number must be greater than zero')
      .required('Number is required'),
  }),
});

const defaultValue: IFrequencyFormData = {
  frequencies: [],
  type: 'xPerWeek',
  xPerMonthTimes: 1,
  xPerWeekTimes: undefined,
  everyXDaysTimes: undefined,
  onCallTimes: undefined,
};

export const getValues = (frequencies?: IFrequency[]): IFrequencyFormData => {
  if (!frequencies || frequencies.length === 0) {
    return defaultValue;
  }

  return {
    ...defaultValue,
    frequencies,
  };
};
