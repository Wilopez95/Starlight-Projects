import { ICurrentUser, UserTokens } from '@root/auth/types';
import { apiConfig } from '@root/core/config';
import * as Sentry from '@sentry/react';

export class AuthService {
  shouldClearTokens() {
    return location.pathname.includes('/login');
  }

  logOut(resourcePath: string, accessToken: string) {
    localStorage.clear();
    location.href = `${apiConfig.apiUrl}/auth/${resourcePath}/logout?token=${accessToken}&systemLogout=1`;
  }

  async tryRefreshToken(resourcePath: string, refreshToken: string): Promise<UserTokens | null> {
    // This request has no effect besides refreshing the token.
    const result = await fetch(`${apiConfig.apiUrl}/auth/${resourcePath}/refresh`, {
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

  goToLogin(resourcePath: string) {
    localStorage.clear();
    location.href = `${apiConfig.apiCP}/auth/${resourcePath}/login`;
  }

  // static because it is only useful to retrieve current user at initialization
  static async currentUser(accessToken: string) {
    const response = await fetch(`${apiConfig.apiUrl}/auth/me`, {
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

  static async submitCodeAndState(code: string, state: string) {
    await fetch(`${apiConfig.apiUrl}/auth/exchange-token`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });
  }
}
