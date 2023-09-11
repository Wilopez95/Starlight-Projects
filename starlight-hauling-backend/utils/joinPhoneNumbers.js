// eslint-disable-next-line no-useless-escape
const cleanPhonePattern = /[^\d \-]+/gi;

export const joinPhoneNumbers = phoneNumbers =>
  phoneNumbers.map(i => i.replace(cleanPhonePattern, '')).filter(i => !!i);
