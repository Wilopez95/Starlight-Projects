import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Layouts, Loadable, Typography } from '@starlightpro/shared-components';

import { hasUserTokensForResource } from '@root/auth/providers/UserProvider/UserProvider';
import { apiConfig } from '@root/core/config';
import { Params, Routes } from '@root/core/consts';
import { useUserContext } from '@root/core/hooks';

import { CustomerPortalImage, Left, StyledButton, StyledForm } from './styles';

const customerIDParams = Params.customerId.replace(':', '');

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const { currentCompany } = useUserContext();
  const history = useHistory();

  const routeParams = useParams<Record<string, string | undefined>>();
  console.log('🚀 ~ file: Login.tsx:24 ~ routeParams:', routeParams);
  const customerID = useMemo(() => routeParams[customerIDParams] || '', [routeParams]);
  console.log('🚀 ~ file: Login.tsx:25 ~ customerID:', customerID);

  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    if (params) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const autoLogin = urlParams.get('auto');
    console.log('🚀 ~ file: Login.tsx:35 ~ useEffect ~ autoLogin:', autoLogin);

    setParams(urlParams);
    setResponseError(errorParam);

    // usually comes from lobby backend as a login target
    if (autoLogin) {
      // TODO check for existing token
      if (customerID && hasUserTokensForResource(`${Routes.Customers}/${customerID}`)) {
        history.replace(`/${Routes.Customers}/${customerID}/${Routes.Profile}`);

        return;
      }

      if (
        window.location.pathname.startsWith(`/${Routes.Lobby}`) &&
        hasUserTokensForResource(Routes.Lobby)
      ) {
        history.replace(`/${Routes.Lobby}`);

        return;
      }

      // window.location.href = `${apiConfig.apiCP}/auth${window.location.pathname}`;
      window.location.href = `${apiConfig.apiUrl}/auth${window.location.pathname}`;
    }

    if (errorParam === 'SessionNotFound') {
      return;
    }

    if (errorParam === 'Unauthorized') {
      return;
    }
  }, [params, setResponseError, history, customerID]);

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    if (responseError && (event.nativeEvent as any).data && params) {
      // only on user input
      setResponseError(null);

      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  const resourcePath = useMemo(() => {
    if (customerID) {
      return `/${Routes.Customers}/${customerID}`;
    }

    return `/${Routes.Lobby}`;
  }, [customerID]);

  const isAutoLogin = location.search.includes('auto=true');

  if (isAutoLogin) {
    return <Loadable />;
  }

  return (
    <Layouts.Box as={Layouts.Flex} height='100%'>
      <Helmet title={t('Titles.Login')} />
      <Left />
      <Layouts.Box
        as={Layouts.Flex}
        height='100%'
        width='560px'
        justifyContent='center'
        alignItems='center'
        direction='column'
      >
        {/* ToDo: Check with we have this logo here , we need the company info , but before login we dont have any company info, by wlopez - 20/04/2023 */}
        {/* <CustomerPortalImage src={currentCompany?.logoUrl as string} alt={'tenant logo'} /> */}
        <StyledForm
          action={`${apiConfig.apiCP}/auth${resourcePath}/login`}
          onChange={onFormChange}
          method='post'
        >
          {responseError && (
            <Typography variant='headerFour' color='alert'>
              {decodeURIComponent(responseError)}
            </Typography>
          )}
          <Layouts.Margin bottom='4' top='2'>
            <Typography variant='headerFive' textAlign='center'>
              {t('pages.Login.Text.Application')}
            </Typography>
          </Layouts.Margin>
          <StyledButton type='submit'>{t('pages.Login.Text.Login')}</StyledButton>
        </StyledForm>
      </Layouts.Box>
    </Layouts.Box>
  );
};

export default LoginPage;
