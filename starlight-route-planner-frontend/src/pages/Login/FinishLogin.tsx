import { useEffect, useMemo } from 'react';

import { useUserContext } from '../../hooks';

const DEFAULT_EXPIRES_IN = '3600';

const FinishLogin = () => {
  const { userTokens, setUserTokens, isLoading } = useUserContext();
  const currentToken = userTokens?.token;
  const search = window.location.search;

  const params = useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  useEffect(() => {
    const token = params.get('token');
    const refreshToken = params.get('refreshToken') ?? '';
    const expiresIn = parseInt(params.get('expiresIn') ?? DEFAULT_EXPIRES_IN, 10);
    const refreshExpiresIn = parseInt(params.get('refreshExpiresIn') ?? DEFAULT_EXPIRES_IN, 10);

    if (!token || token === currentToken) {
      return;
    }

    // TODO set current user
    setUserTokens({
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toUTCString(),
      refreshExpiresAt: new Date(Date.now() + (refreshExpiresIn || 3600) * 1000).toUTCString(),
    });
  }, [currentToken, params, setUserTokens]);

  useEffect(() => {
    const token = params.get('token');

    if (isLoading || currentToken !== token) {
      return;
    }

    params.delete('token');
    params.delete('expiresIn');
    params.delete('refreshToken');
    params.delete('refreshExpiresIn');
    params.delete('reqId');

    let redirectTo = localStorage.getItem('redirectTo');

    if (redirectTo) {
      localStorage.removeItem('redirectTo');
    } else {
      redirectTo = window.location.pathname.replace('/finish-login', '');
    }

    window.location.href = redirectTo;
  }, [currentToken, params, isLoading]);

  return null;
};

export default FinishLogin;
