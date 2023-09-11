import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { orderCancellationReasonTypeOptions } from '@root/consts';
import { notNullObject } from '@root/helpers';

import { ICancelOrderData } from './types';

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    comment: Yup.string()
      .trim()
      .max(120, t(`components.forms.CancelOrder.ValidationErrors.Max120Chars`)),
  });

const defaultValue: ICancelOrderData = {
  addTripCharge: false,
  reasonType: orderCancellationReasonTypeOptions[0],
  comment: '',
};

export const getValues = (item?: ICancelOrderData): ICancelOrderData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
