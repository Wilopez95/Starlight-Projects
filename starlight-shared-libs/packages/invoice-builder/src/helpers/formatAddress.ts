import type { IAddress } from '../types';

export const formatShortAddress = (address: IAddress): string => {
  const address2 = address.addressLine2 ? `, ${address.addressLine2}` : '';

  return `${address.addressLine1}${address2}`;
};

export const formatAddress = (address: IAddress): string =>
  `${formatShortAddress(address)}, ${address.city}, ${address.state}, ${address.zip}`;

export const addressExists = (address: IAddress): boolean =>
  (Object.keys(address) as (keyof IAddress)[]).some(key => address[key]);
