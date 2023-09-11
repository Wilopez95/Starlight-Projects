import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { BusinessLineType } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { notNullObject } from '@root/helpers';
import { BusinessLineStore } from '@root/stores/businessLine/BusinessLineStore';
import { type IBusinessLine } from '@root/types';

export const generateValidationSchema = (
  businessLineStore: BusinessLineStore,
  t: TFunction,
  i18n: string,
) => {
  const currentBusinessLine = businessLineStore.selectedEntity;
  const names = businessLineStore.sortedValues
    .filter(item => item.id !== currentBusinessLine?.id)
    .map(item => item.name);

  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(t(`${i18n}NameRequired`))
      .notOneOf(names, t(`${i18n}NameUniq`)),
    active: Yup.boolean().required(),
    shortName: Yup.string()
      .max(5, t(`${i18n}ShortNameLength`))
      .required(t(`${i18n}ShortNameRequired`)),
    description: Yup.string(),
    type: Yup.string(),
  });
};

const defaultValue: IBusinessLine = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: '',
  description: '',
  shortName: '',
  active: true,
  type: isCore && enableRecyclingFeatures ? BusinessLineType.recycling : BusinessLineType.rollOff,
  billingCycle: '',
  billingType: '',
  spUsed: false,
};

export const getValues = (item?: IBusinessLine | null) => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
