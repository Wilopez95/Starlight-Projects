import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { ChangeReasonStore } from '@root/stores/changeReason/ChangeReasonStore';
import { IChangeReason } from '@root/types';

import { IChangeReasonFormData } from './types';

const defaultValue: IChangeReasonFormData = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  businessLineIds: [],
};

export const getValues = (item: IChangeReason | null): IChangeReasonFormData => {
  if (!item) {
    return defaultValue;
  }

  return {
    ...notNullObject(item, defaultValue),
    businessLineIds: item.businessLines.map(({ id }) => id),
  };
};

export const generateValidationSchema = (
  changeReasonStore: ChangeReasonStore,
  t: TFunction,
  i18n: string,
) => {
  const currentId = changeReasonStore.selectedEntity?.id;
  const descriptions = changeReasonStore.values.reduce((acc: string[], currentValue) => {
    if (currentId && currentValue.id === currentId) {
      return acc;
    }

    acc.push(currentValue.description);

    return acc;
  }, []);

  return Yup.object().shape({
    active: Yup.boolean(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionRequired`))
      .max(50, t('ValidationErrors.PleaseEnterUpTo', { number: 50 }))
      .notOneOf(descriptions, t(`${i18n}DescriptionUnique`)),
    businessLineIds: Yup.array().required(t(`${i18n}LinesOfBusinessRequired`)),
  });
};
