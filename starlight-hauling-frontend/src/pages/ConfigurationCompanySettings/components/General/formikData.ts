import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { Regions } from '@root/i18n/config/region';
import { IGeneralSettings, NullableProperty } from '@root/types';

export type GeneralSettings = NullableProperty<IGeneralSettings, 'id' | 'updatedAt' | 'createdAt'>;

export const initialValues: GeneralSettings = {
  timeZoneName: 'America/New_York',
  region: Regions.US,
  unit: 'us',
  id: undefined,
  updatedAt: undefined,
  createdAt: undefined,
  clockIn: false,
};

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    timeZoneName: Yup.string().required(t(`${i18n}TimeZoneRequired`)),
    unit: Yup.string().required(t(`${i18n}UnitsOfMeasurementRequired`)),
  });
