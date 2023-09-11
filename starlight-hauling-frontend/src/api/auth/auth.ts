import * as Sentry from '@sentry/react';

import { apiConfig } from '@root/config';
import { UserTokens } from '@root/types';

import { IMeResponse } from './types';

export class AuthService {
  shouldClearTokens() {
    return location.pathname.includes('/login');
  }

  logOut(resourcePath: string, accessToken: string) {
    localStorage.clear();

    location.href = `${apiConfig.apiUrl}/auth/${resourcePath}/logout?token=${accessToken}&systemLogout=1`;
  }

  goToLogin(resourcePath: string) {
    localStorage.clear();

    location.href = `${apiConfig.apiUrl}/auth/${resourcePath}/login`;
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
      const user: IMeResponse = await response.json();

      Sentry.setUser({
        id: user.id,
        username: user.name,
        email: user.email,
      });

      return user;
    }

    return null;
  }
}
