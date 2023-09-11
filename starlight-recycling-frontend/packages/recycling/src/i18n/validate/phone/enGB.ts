import validator from 'validator';

export const validatePhoneNumber = (number: string): boolean =>
  validator.isMobilePhone(number, 'en-GB');
