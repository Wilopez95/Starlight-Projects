import { type IAddress, type IEntity, type IPhoneNumber } from './';
import { type IPolicy, type IRole } from './role';

export interface ISalesRepresentative {
  businessUnitId: number;
  commissionAmount: number;
}

export interface IUser extends IEntity {
  active: boolean;
  email: string;
  name: string;
  hasPersonalPermissions: boolean;
  phones: Omit<IPhoneNumber, 'id'>[];
  policies?: IPolicy[];
  roles?: IRole[];
  salesRepresentatives: ISalesRepresentative[];
  firstName?: string;
  lastName?: string;
  title?: string;
  address?: Omit<IAddress, 'id'>;
}
