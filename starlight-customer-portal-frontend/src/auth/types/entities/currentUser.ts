import { ICompany, LogoInformation } from '@root/core/types';

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

export type CurrentUser = Omit<ICurrentUser, 'permissions'> & {
  permissions: Set<string>;
};

export interface IUserContext {
  currentUser?: CurrentUser;
  error?: string;
  userTokens?: UserTokens;
  isLoading: boolean;
  currentCompany?: ICompany;

  logOut(): void;

  updateUserInfo(forced?: boolean): void;

  setError(error?: string): void;
  setCompany(company: LogoInformation | ICompany): void;
  setUserTokens(tokens: UserTokens): void;
}
