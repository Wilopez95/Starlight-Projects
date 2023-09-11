import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router-dom';
import { Typography, Loadable } from '@starlightpro/shared-components';
import { apiConfig } from '@root/auth/config';
import { Params, Routes } from '@root/routes/routing';
import { AuthLayout } from '@root/components/AuthLayout/AuthLayout';
import { hasUserTokensForResource } from '../../providers/UserProvider/UserProvider';
import { Image, StyledButton, StyledForm } from './styles';

const businessUnitParam = Params.businessUnit.replace(':', '');
const tenantNameParam = Params.tenantName.replace(':', '');

const LoginPage = () => {
  const [params, setParams] = useState(null);
  const history = useHistory();
  const routeParams = useParams();

  const businessUnit = useMemo(() => routeParams[businessUnitParam] || '', [routeParams]);
  const tenantName = useMemo(() => routeParams[tenantNameParam] || '', [routeParams]);
  const [responseError, setResponseError] = useState(null);

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

    // eslint-disable-next-line no-empty
    if (errorParam === 'Unauthorized') {
    }
  }, [params, setResponseError, history, businessUnit, tenantName]);

  const onFormChange = (event) => {
    if (responseError && event.nativeEvent.data && params) {
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
      <Helmet title="Dispatch Login" />
      <Image />
      <StyledForm
        action={`${apiConfig.apiUrl}/auth${resourcePath}/login`}
        onChange={onFormChange}
        method="post"
      >
        {responseError ? (
          <Typography variant="headerFour" color="alert">
            {/* {decodeURIComponent(responseError)} */}
          </Typography>
        ) : null}
        <StyledButton type="submit">Log in</StyledButton>
      </StyledForm>
    </AuthLayout>
  );
};

export default LoginPage;
