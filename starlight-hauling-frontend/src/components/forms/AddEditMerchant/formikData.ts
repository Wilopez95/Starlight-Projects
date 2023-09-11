import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';

import { IMerchantInput } from './types';

const I18N_PATH = 'components.forms.AddEditMerchant.ValidationErrors.';

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    mid: Yup.string()
      .trim()
      .required(t(`${I18N_PATH}MidRequired`)),
    username: Yup.string()
      .trim()
      .required(t(`${I18N_PATH}UsernameRequired`)),
    password: Yup.string()
      .trim()
      .required(t(`${I18N_PATH}PasswordRequired`)),
  });

const defaultValue: IMerchantInput = {
  mid: '',
  username: '',
  password: '',
};

export const getValues = (item?: Partial<IMerchantInput>): IMerchantInput => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
