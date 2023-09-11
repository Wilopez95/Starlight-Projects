import { useEffect } from 'react';

import { StorageKeys } from '@root/auth/types/data-storage';
import { Routes } from '@root/core/consts';
import { useUserContext } from '@root/core/hooks';

const DEFAULT_EXPIRES_IN = '3600';

const FinishLogin = () => {
  const { userTokens, setUserTokens } = useUserContext();
  const currentToken = userTokens?.token;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get('token');
    const refreshToken = params.get('refreshToken') || '';
    const expiresIn = parseInt(params.get('expiresIn') || DEFAULT_EXPIRES_IN);
    const refreshExpiresIn = parseInt(params.get('refreshExpiresIn') || DEFAULT_EXPIRES_IN);

    if (!token || token === currentToken) {
      return;
    }

    setUserTokens({
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toUTCString(),
      refreshExpiresAt: new Date(Date.now() + (refreshExpiresIn || 3600) * 1000).toUTCString(),
    });

    let redirectTo = localStorage.getItem(StorageKeys.RedirectTo);

    if (redirectTo) {
      localStorage.removeItem(StorageKeys.RedirectTo);
    } else {
      redirectTo = window.location.pathname.replace(`/${Routes.FinishLogin}`, '');
    }

    window.location.href = redirectTo;
  }, [currentToken, setUserTokens]);

  return null;
};

export default FinishLogin;
