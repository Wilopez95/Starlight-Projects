import { IAddress } from '@root/types';

export const addressFormatShort = (address: Partial<IAddress>) =>
  [address?.addressLine1, address?.addressLine2].filter(Boolean).join(', ');

export const addressFormat = (address: Omit<IAddress, 'id'>) =>
  [addressFormatShort(address), address.city, address.state, address.zip]
    .filter(Boolean)
    .join(', ');
