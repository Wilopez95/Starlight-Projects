import { IAddress } from '@root/types';

export interface IAddressesFormData {
  physicalAddress: IAddress;
  mailingAddress: IAddress & {
    sameAsPhysical?: boolean;
  };
}
