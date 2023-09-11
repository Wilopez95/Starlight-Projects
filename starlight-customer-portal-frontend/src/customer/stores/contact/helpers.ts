import { IContact } from '@root/core/types';

export const sanitizeContact = (data: IContact) => {
  if (data.phoneNumbers?.length === 0) {
    data.phoneNumbers = undefined;
  } else {
    data.phoneNumbers?.forEach((phoneNumber) => {
      if (phoneNumber.id === 0) {
        delete phoneNumber.id;
      }
    });
  }

  return data;
};
