import { ICurrentUser } from '@root/types';

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IMeResponse extends Omit<ICurrentUser, 'company' | 'permissions'> {
  permissions: string[];
}
