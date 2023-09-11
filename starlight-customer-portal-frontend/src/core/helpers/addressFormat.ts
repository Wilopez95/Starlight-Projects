import { IAddress } from '@root/core/types';

export const addressFormatShort = (address: IAddress) => {
  const address2 = address.addressLine2 ? `, ${address.addressLine2}` : '';

  return `${address.addressLine1}${address2}`;
};

export const addressFormat = (address: IAddress) =>
  `${addressFormatShort(address)}, ${address.city}, ${address.state}, ${address.zip}`;
