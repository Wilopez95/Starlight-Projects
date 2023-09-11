import { validateEnUSPhoneNumber } from './enUS';

export const validateFrCAPhoneNumber = (phoneNumber: string): boolean => {
  return validateEnUSPhoneNumber(phoneNumber);
};
