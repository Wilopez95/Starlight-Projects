import { IAddress } from '@root/core/types';
import { ICustomer } from '@root/customer/types';

export interface IEditCustomerData
  extends Omit<ICustomer, 'createdAt' | 'updatedAt' | 'customerGroup' | 'businessUnit' | 'onHold'> {
  commercial: boolean;
  searchString: string;
  billingAddress: IAddress & {
    billingAddressSameAsMailing?: boolean;
  };
  phoneNumber?: string;
}
