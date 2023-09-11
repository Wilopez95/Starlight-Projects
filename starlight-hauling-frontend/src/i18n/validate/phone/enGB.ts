import validator from 'validator';

export const validateEnGBPhoneNumber = (phoneNumber: string): boolean => {
  return validator.isMobilePhone(phoneNumber.replace(/\D/g, ''), 'en-GB');
};
