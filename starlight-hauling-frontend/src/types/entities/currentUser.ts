import { ICompany } from './company';

export interface ICurrentUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  company: ICompany | null;
  resource: string;
  permissions: Set<string>;
  tenantName: string;
}

export interface UserTokens {
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
}
