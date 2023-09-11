import {
  type IAddress,
  type IPhoneNumber,
  type IPolicyEntries,
  type ISalesRepresentative,
  type IUser,
} from '@root/types';

export interface IUserCreateInput extends IUserUpdateInput {
  email: string;
}

export interface IUserUpdateInput {
  active: boolean;
  firstName: string;
  lastName: string;
  title: string;
  phones: Omit<IPhoneNumber, 'id'>[];
  roleIds: string[];
  policies: IPolicyEntries[];
  salesRepresentatives: ISalesRepresentative[];
  address?: Omit<IAddress, 'id'>;
}

export interface IUserQueryResult extends Omit<IUser, 'policies'> {
  allPermissions: IPolicyEntries[];
}
