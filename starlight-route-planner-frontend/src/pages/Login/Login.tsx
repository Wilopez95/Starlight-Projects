import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Typography } from '@starlightpro/shared-components';

import { apiConfig } from '@root/config';
import { Params, Routes } from '@root/consts';

import { useUserContext } from '../../hooks';
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout';

import { Image, StyledButton, StyledForm } from './styles';

const businessUnitParam = Params.businessUnit.replace(':', '');
const tenantNameParam = Params.tenantName.replace(':', '');

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const { hasUserTokensForResource } = useUserContext();
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();
  const businessUnit = useMemo(() => routeParams[businessUnitParam] ?? '', [routeParams]);
  const tenantName = useMemo(() => routeParams[tenantNameParam] ?? '', [routeParams]);
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    if (params) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const autoLogin = urlParams.get('auto');

    setParams(urlParams);
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
        window.location.pathname.startsWith(`/${Routes.Lobby}`) &&
        hasUserTokensForResource(Routes.Lobby)
      ) {
        history.replace(`/${Routes.Lobby}`);

        return;
      }

      window.location.href = `${apiConfig.haulingApiUrl}/auth${window.location.pathname}`;
    }

    // if (errorParam === 'SessionNotFound') {

    // }

    // if (errorParam === 'Unauthorized') {

    // }
  }, [params, setResponseError, history, businessUnit, tenantName, hasUserTokensForResource]);

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    if (responseError && event.currentTarget.data && params) {
      // only on user input
      setResponseError(null);

      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  // TODO restrict login page for only lobby and configuration
  const resourcePath = useMemo(() => {
    return `/${Routes.Lobby}`;
  }, []);

  return (
    <AuthLayout>
      <Image />
      <StyledForm
        action={`${apiConfig.haulingApiUrl}/auth${resourcePath}/login`}
        onChange={onFormChange}
        method="post"
      >
        {responseError && (
          <Typography variant="headerFour" color="alert">
            {decodeURIComponent(responseError)}
          </Typography>
        )}
        <StyledButton type="submit">{t('pages.Login.Text.Login')}</StyledButton>
      </StyledForm>
    </AuthLayout>
  );
};

export default LoginPage;
