import { IEntity } from './';
import { IPhoneNumber } from './phoneNumber';

export interface IContact extends IEntity {
  active: boolean;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  allowContractorApp: boolean;
  allowCustomerPortal: boolean;
  customerId?: number;
  phoneNumbers?: IPhoneNumber[];
  main?: boolean;
}
