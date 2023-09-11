import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';

import { IConfirmTruckAndDriverCostData } from './types';

const defaultValue: IConfirmTruckAndDriverCostData = {
  businessUnitId: 0,
  date: new Date(),
};

export const generateValidationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    date: Yup.date()
      .required(t(`${i18n}EffectivePeriodIsRequired`))
      .nullable(),
  });

export const getValues = (item: IConfirmTruckAndDriverCostData | null) => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
