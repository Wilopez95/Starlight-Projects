import validator from 'validator';

export const validateEnUSPhoneNumber = (phoneNumber: string): boolean => {
  return validator.isMobilePhone(phoneNumber, 'en-US');
};
