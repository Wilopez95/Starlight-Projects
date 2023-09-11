import React, { FC, useCallback, useEffect, useState, useMemo } from 'react';

import { Trans, useTranslation } from '../../../i18n';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import getServiceInfo from '../../../utils/getServiceInfo';
import { getLocalStorageAuthData } from '../../../service/utils';
import partialReplace from '../../../utils/partialReplace';

const LoginForm: FC<{ localStorageUserKey: string }> = ({ localStorageUserKey }) => {
  const [t] = useTranslation();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const serviceInfo = getServiceInfo();
  const urlSearch = window.location.search;
  const urlParams = useMemo(() => {
    return new URLSearchParams(urlSearch);
  }, [urlSearch]);
  const isAutoLogin = urlParams.get('auto') === 'true';

  const getApiLoginUrl = useCallback((info: typeof serviceInfo = null) => {
    if (!info) {
      return '';
    }

    return `/api/${info.platformAccount}/recycling/${info.serviceAccount}/login?auto=true`;
  }, []);

  useEffect(() => {
    if (params) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const autoLogin = urlParams.get('auto');
    const pathname = window.location.pathname;
    const origin = window.location.origin;

    setParams(urlParams);
    setResponseError(errorParam);

    // TODO check for existing token
    if (autoLogin) {
      // we get redirect link from lobby item
      const replaceFromTo = {
        '/login': '',
      };
      const defaultRedirect = `${origin}${partialReplace(pathname, replaceFromTo)}`;

      const userInfo = getLocalStorageAuthData(localStorageUserKey);
      const redirectTo = localStorage.getItem('redirectTo') || defaultRedirect;

      if (userInfo) {
        window.location.href = redirectTo;

        localStorage.removeItem('redirectTo');

        return;
      }

      localStorage.setItem('redirectTo', redirectTo);
      localStorage.setItem('loginUrl', `${origin}${pathname}`);

      window.location.href = `${origin}${getApiLoginUrl(serviceInfo)}`;
    }

    if (errorParam === 'SessionNotFound') {
      return;
    }

    if (errorParam === 'Unauthorized') {
      return;
    }
  }, [getApiLoginUrl, localStorageUserKey, params, serviceInfo]);

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    if (responseError && (event.nativeEvent as any).data && params) {
      // only on user input
      setResponseError(null);

      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  if (!serviceInfo) {
    // eslint-disable-next-line
    console.error("Couldn't parse service info from url");

    return null;
  }

  if (isAutoLogin) {
    return <CircularProgress size={40} color="primary" />;
  }

  return (
    <form action={getApiLoginUrl(serviceInfo)} onChange={onFormChange} method="post">
      {responseError && (
        <Box>
          <Typography color="error">{t(decodeURIComponent(responseError))}</Typography>
          <br />
          <br />
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Button type="submit" variant="contained" color="primary" size="large">
          <Trans>Log In With Starlight SSO</Trans>
        </Button>
      </Box>
    </form>
  );
};

export default LoginForm;
