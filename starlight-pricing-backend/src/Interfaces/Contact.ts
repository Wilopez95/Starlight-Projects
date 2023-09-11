import { IEntity } from './Entity';

export type PhoneNumberType = 'main' | 'home' | 'work' | 'cell' | 'other';

export interface IPhoneNumber {
  id: number;
  type: PhoneNumberType;
  number: string;
  textOnly?: boolean;
  extension?: string;
}

export interface IContact extends IEntity {
  active: boolean;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  allowContractorApp: boolean;
  allowCustomerPortal: boolean;
  customerPortalUser: boolean;
  customerId?: number;
  phoneNumbers?: IPhoneNumber[];
  main?: boolean;
  originalId: number;
}
