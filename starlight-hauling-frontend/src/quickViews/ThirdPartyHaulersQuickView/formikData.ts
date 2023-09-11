import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { IThirdPartyHauler } from '@root/types';

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionRequired`)),
  });

const defaultValue: IThirdPartyHauler = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  originalId: 0,
};

export const getValues = (item?: IThirdPartyHauler | null) => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
