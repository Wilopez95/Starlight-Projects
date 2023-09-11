import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { IFinanceChargesSettings, NullableProperty } from '@root/types';

export type FinanceChargesSettings = NullableProperty<
  IFinanceChargesSettings,
  'id' | 'updatedAt' | 'createdAt'
>;

export const initialValues: FinanceChargesSettings = {
  financeChargeMethod: 'days',
  financeChargeApr: 0,
  financeChargeMinBalance: 0,
  financeChargeMinValue: 0,
  id: undefined,
  updatedAt: undefined,
  createdAt: undefined,
};

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    financeChargeMethod: Yup.string(),
    financeChargeApr: Yup.number()
      .typeError(t(`${i18n}MustBeNumeric`))
      .required(t(`${i18n}APRRequired`))
      .min(0, t(`${i18n}CanNotBeLess`)),
    financeChargeMinBalance: Yup.number()
      .typeError(t(`${i18n}MustBeNumeric`))
      .required(t(`${i18n}MinimumBalanceRequired`))
      .min(0, t(`${i18n}CanNotBeLess`)),
    financeChargeMinValue: Yup.number()
      .typeError(t(`${i18n}MustBeNumeric`))
      .required(t(`${i18n}MinimumFinanceRequired`))
      .min(0, t(`${i18n}CanNotBeLess`)),
  });
