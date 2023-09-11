import { Maybe } from '@root/types';

// eslint-disable-next-line prefer-regex-literals
const priceRegExp = new RegExp(/^\d*(\.\d{1,2})?$/);

export const priceValidator = (value?: Maybe<number>) => {
  const valueStr = value?.toString();

  return !valueStr || priceRegExp.test(valueStr);
};
