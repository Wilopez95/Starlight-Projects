import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { IMaterialProfile } from '@root/types';

export const validationSchema = (t: TFunction, i18n: string, isNew: boolean) => {
  return Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionIsRequired`)),
    disposalSiteId: Yup.number()
      .positive(t(`${i18n}DisposalSiteIsRequired`))
      .required(t(`${i18n}DisposalSiteIsRequired`)),
    materialId: Yup.number()
      .positive(t(`${i18n}MaterialIsRequired`))
      .required(t(`${i18n}MaterialIsRequired`)),
    expirationDate: Yup.date()
      .nullable()
      .test(
        'expirationDate',
        t('ValidationErrors.ExpirationDateMustBeGreaterThanToday'),
        expirationDate => {
          const today = new Date();

          if (!isNew) {
            return true;
          }

          if (expirationDate) {
            return today < expirationDate;
          }

          return true;
        },
      ),
  });
};

const defaultValue: IMaterialProfile = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  disposalSiteId: 0,
  materialId: 0,
  disposalSiteDescription: undefined,
  materialDescription: undefined,
  expirationDate: null,
  businessLineId: '',
};

export const getValues = (businessLineId: string, item?: IMaterialProfile | null) => {
  if (!item) {
    return { ...defaultValue, businessLineId };
  }

  return notNullObject(item, defaultValue);
};
