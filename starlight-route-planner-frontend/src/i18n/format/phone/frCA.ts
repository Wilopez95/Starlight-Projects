import { formatEnUSPhoneNumber } from './enUS';

// alias to enUS, frCA has same format as enUS
export const formatFrCAPhoneNumber = (phoneNumber: string): string | undefined => {
  return formatEnUSPhoneNumber(phoneNumber);
};
