import { apiConfig } from '@root/config';
import { type ICurrentUser, type UserTokens } from '@root/types';

export class AuthService {
  logOut(resourcePath: string, accessToken: string) {
    localStorage.setItem('redirectTo', window.location.href);

    location.href = `${apiConfig.haulingApiUrl}/auth/${resourcePath}/logout?token=${accessToken}&systemLogout=1`;
  }

  goToLogin(resourcePath: string) {
    localStorage.setItem('redirectTo', window.location.href);

    location.href = `${apiConfig.haulingApiUrl}/auth/${resourcePath}/login`;
  }

  async tryRefreshToken(resourcePath: string, refreshToken: string): Promise<UserTokens | null> {
    // This request has no effect besides refreshing the token.
    const result = await fetch(`${apiConfig.haulingApiUrl}/auth/${resourcePath}/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (result.ok) {
      return result.json() as Promise<UserTokens>;
    }

    return null;
  }

  // static because it is only useful to retrieve current user at initialization
  static async currentUser(accessToken: string) {
    const response = await fetch(`${apiConfig.haulingApiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const user = await response.json();

      return user as Omit<ICurrentUser, 'company'>;
    }

    return null;
  }
}
