import i18next from 'i18next';
import { TestMessageParams } from 'yup';

import { EMAIL_DOMAIN_VALIDATION } from '@root/consts';

export const emailValidator = (props: { regex: RegExp } & Partial<TestMessageParams>) => {
  const value: unknown = props.value;

  if (typeof value == 'string') {
    const amount = value.match(/@/g)?.length ?? 0;

    if (amount !== 1) {
      return i18next.t('ValidationErrors.EmailAtSignFormat');
    }

    if (!EMAIL_DOMAIN_VALIDATION.exec(value.split('@').reverse()[0])) {
      return i18next.t('ValidationErrors.WrongEmailDomainFormat');
    }

    if (!props.regex.exec(value)) {
      return i18next.t('ValidationErrors.WrongEmailFormat');
    }
  }
  return '';
};
