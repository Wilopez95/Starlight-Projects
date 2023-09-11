import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { MaterialStore } from '@root/stores/material/MaterialStore';
import { IMaterial } from '@root/types';

export const generateValidationSchema = (
  materialStore: MaterialStore,
  t: TFunction,
  i18n: string,
  duplicate: boolean,
) => {
  const currentId = materialStore.selectedEntity?.id;
  let materials = materialStore.values;

  if (currentId && !duplicate) {
    materials = materials.filter(material => material.id !== currentId);
  }

  const descriptions = materials.map(material => material.description);

  return Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionIsRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionMustBeUnique`)),
    manifested: Yup.boolean().required(),
    recycle: Yup.boolean().required(),
    misc: Yup.boolean().required(),
    equipmentItemIds: Yup.array().ensure(),
    code: Yup.string()
      .strict(true)
      .trim(t('ValidationErrors.WhitespaceNotAllowed'))
      .nullable()
      .max(10, t('ValidationErrors.PleaseEnterUpTo', { number: 10 }))
      .matches(/^[a-zA-Z0-9]*$/, t(`${i18n}CodeIsAlphaNumeric`)),
  });
};

const defaultValue: IMaterial = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  manifested: false,
  recycle: false,
  yard: true,
  misc: false,
  landfillCanOverride: false,
  businessLineId: '',
  useForLoad: true,
  useForDump: true,
  equipmentItemIds: [],
  code: '',
};

export const getDuplicateValues = (item: IMaterial) => ({
  ...item,
  description: '',
});

export const getValues = (businessLineId: string, item?: IMaterial | null) => {
  if (!item) {
    return { ...defaultValue, businessLineId };
  }

  return notNullObject(item, defaultValue);
};
