import { IContact, IPhoneNumber } from '@root/types';

// if here are no phone numbers with type "main"
// first phone number have to be set as "main" due to business logic
// issue
export const setMainType = (phoneNumbers: IPhoneNumber[]) => {
  if (!phoneNumbers.some(({ type }) => type === 'main')) {
    phoneNumbers[0].type = 'main';
  }

  return phoneNumbers;
};

export const sanitizeContact = (data: IContact) => {
  if (data.phoneNumbers?.length === 0) {
    data.phoneNumbers = undefined;
  } else {
    data.phoneNumbers?.forEach(phoneNumber => {
      if (phoneNumber.id === 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        delete phoneNumber.id;
      }
    });

    data.phoneNumbers = setMainType(data.phoneNumbers as IPhoneNumber[]);
  }

  return data;
};
