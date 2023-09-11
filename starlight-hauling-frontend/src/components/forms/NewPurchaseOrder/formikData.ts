import { isAfter, isBefore } from 'date-fns';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { IBusinessLine, IPurchaseOrder } from '@root/types';

export const validationSchema = (t: TFunction, i18nPath: string) =>
  Yup.object().shape({
    active: Yup.boolean().required(),
    poNumber: Yup.string().required(t(`${i18nPath}PoNumberRequired`)),
    poAmount: Yup.number().nullable(),
    effectiveDate: Yup.date()
      .nullable()
      .test(
        'effectiveDate',
        t(`${i18nPath}EffectiveDateMustBeLessThanExpirationDate`),
        function (effectiveDate) {
          if (effectiveDate) {
            return !isAfter(effectiveDate, this.parent.expirationDate as Date);
          }

          return true;
        },
      ),
    expirationDate: Yup.date()
      .nullable()
      .test(
        'expirationDate',
        t(`${i18nPath}ExpirationDateMustBeGreaterThanEffectiveDate`),
        function (expirationDate) {
          if (expirationDate) {
            return !isBefore(expirationDate, this.parent.effectiveDate as Date);
          }

          return true;
        },
      ),
    businessLineIds: Yup.array().required(t(`${i18nPath}LinesOfBusinessRequired`)),
  });

const defaultValue = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  poNumber: '',
  poAmount: null,
  effectiveDate: null,
  expirationDate: null,
  businessLineIds: [],
  isOneTime: false,
  customerId: '',
  businessUnitId: '',
};

export const getValues = (businessLines?: IBusinessLine[]): IPurchaseOrder => {
  return {
    ...defaultValue,
    businessLineIds: businessLines?.map(({ id }) => id) ?? [],
  };
};
