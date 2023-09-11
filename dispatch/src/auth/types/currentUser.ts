export interface ICurrentUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  resource: string;
  permissions: string[];
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
  currentCompany?: unknown;

  logOut(): void;

  setError(error?: string): void;

  setUserTokens(tokens: UserTokens): void;
}
