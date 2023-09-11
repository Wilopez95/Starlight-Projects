import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import { StarlightLogo } from '@root/assets';
import { Loadable, Typography } from '@root/common';
import { AuthLayout } from '@root/components';
import { hasUserTokensForResource } from '@root/components/UserProvider/UserProvider';
import { apiConfig } from '@root/config';
import { Params, Routes } from '@root/consts';

import { Image, StyledButton, StyledForm } from './styles';

interface IEventData extends Event {
  data: unknown; // The correct type is no clear for now
}

const businessUnitParam = Params.businessUnit.replace(':', '');
const tenantNameParam = Params.tenantName.replace(':', '');

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useRef<URLSearchParams | undefined>();
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();

  const businessUnit = useMemo(() => routeParams[businessUnitParam] ?? '', [routeParams]);
  const tenantName = useMemo(() => routeParams[tenantNameParam] ?? '', [routeParams]);
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    if (params.current) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const autoLogin = urlParams.get('auto');

    params.current = urlParams;
    setResponseError(errorParam);

    // usually comes from lobby backend as a login target
    if (autoLogin) {
      // TODO check for existing token
      if (
        businessUnit &&
        tenantName &&
        hasUserTokensForResource(`${Routes.BusinessUnits}/${businessUnit}`)
      ) {
        history.replace(`/${Routes.BusinessUnits}/${businessUnit}`);

        return;
      }

      if (
        tenantName &&
        window.location.pathname.includes(`${Routes.Configuration}`) &&
        hasUserTokensForResource(Routes.Configuration)
      ) {
        history.replace(`/${Routes.Configuration}`);

        return;
      }

      if (
        window.location.pathname.startsWith(`/${Routes.Lobby}`) &&
        hasUserTokensForResource(Routes.Lobby)
      ) {
        history.replace(`/${Routes.Lobby}`);

        return;
      }

      window.location.href = `${apiConfig.apiUrl}/auth${window.location.pathname}`;
    }

    if (errorParam === 'SessionNotFound') {
      return;
    }

    if (errorParam === 'Unauthorized') {
    }
  }, [params, setResponseError, history, businessUnit, tenantName]);

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    if (responseError && (event.nativeEvent as IEventData).data && params) {
      // only on user input
      setResponseError(null);

      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  // TODO restrict login page for only lobby and configuration
  const resourcePath = useMemo(() => {
    const currentPathname = window.location.pathname;

    if (currentPathname.startsWith(`/${Routes.Configuration}`)) {
      return `/${Routes.Configuration}`;
    }

    return `/${Routes.Lobby}`;
  }, []);

  const isAutoLogin = location.search.includes('auto=true');

  if (isAutoLogin) {
    return <Loadable />;
  }

  return (
    <AuthLayout>
      <Helmet title={t('Titles.Login')} />
      <Image src={StarlightLogo} />
      <StyledForm
        action={`${apiConfig.apiUrl}/auth${resourcePath}/login`}
        onChange={onFormChange}
        method="post"
      >
        {responseError ? (
          <Typography variant="headerFour" color="alert">
            {decodeURIComponent(responseError)}
          </Typography>
        ) : null}
        <StyledButton type="submit">{t('pages.Login.Text.Login')}</StyledButton>
      </StyledForm>
    </AuthLayout>
  );
};

export default LoginPage;
