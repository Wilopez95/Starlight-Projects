import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { CustomerGroupType, ICustomerGroup } from '@root/types';

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionRequired`)),
    type: Yup.string()
      .oneOf([
        CustomerGroupType.commercial,
        CustomerGroupType.nonCommercial,
        CustomerGroupType.walkUp,
      ])
      .required(t(`${i18n}TypeRequired`)),
  });

const defaultValue: ICustomerGroup = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  type: CustomerGroupType.commercial,
  spUsed: false,
};

export const getValues = (item?: ICustomerGroup | null): ICustomerGroup => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
