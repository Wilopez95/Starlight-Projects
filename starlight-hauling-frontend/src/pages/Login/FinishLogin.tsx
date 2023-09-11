import { useEffect } from 'react';

import { Routes } from '@root/consts';

import { useUserContext } from '../../hooks';

const DEFAULT_EXPIRES_IN = '3600';

const FinishLogin = () => {
  const { userTokens, setUserTokens } = useUserContext();
  const currentToken = userTokens?.token;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get('token');
    const refreshToken = params.get('refreshToken') ?? '';
    const expiresIn = parseInt(params.get('expiresIn') ?? DEFAULT_EXPIRES_IN, 10);
    const refreshExpiresIn = parseInt(params.get('refreshExpiresIn') ?? DEFAULT_EXPIRES_IN, 10);

    const postAuth = params.get('postAuth');

    if (!token || token === currentToken) {
      return;
    }

    setUserTokens({
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toUTCString(),
      refreshExpiresAt: new Date(Date.now() + (refreshExpiresIn || 3600) * 1000).toUTCString(),
    });

    let redirectTo = localStorage.getItem('redirectTo');

    if (postAuth) {
      localStorage.setItem('postAuth', postAuth);
    }

    if (redirectTo) {
      localStorage.removeItem('redirectTo');
    } else {
      redirectTo = window.location.pathname.replace(`/${Routes.FinishLogin}`, '');
    }

    window.location.href = redirectTo;
  }, [currentToken, setUserTokens]);

  return null;
};

export default FinishLogin;
