import { IAddress } from '@root/types';

export const formatAddress = (address?: IAddress) => {
  if (!address) {
    return '-';
  }

  const { addressLine1, addressLine2, city, state, zip } = address;

  return `${addressLine1 ?? addressLine2 ?? ''}, ${city}, ${state} ${zip}`;
};
