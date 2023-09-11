import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { emailValidator, notNullObject } from '@root/helpers';
import { IBroker } from '@root/types';

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(t(`${i18n}NameRequired`)),
    email: Yup.string()
      .trim()
      .email(emailValidator)
      .required(t(`${i18n}EmailRequired`)),
    active: Yup.boolean().required(),
    shortName: Yup.string().required(t(`${i18n}ShortNameRequired`)),
    billing: Yup.string(),
  });

const defaultValue: IBroker = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: '',
  email: '',
  active: true,
  shortName: '',
  billing: 'broker',
};

export const getValues = (item?: IBroker | null) => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
