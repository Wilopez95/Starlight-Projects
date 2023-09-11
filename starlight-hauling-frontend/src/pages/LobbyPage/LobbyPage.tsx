import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { StarlightLogo } from '@root/assets';
import { Typography } from '@root/common';
import { LobbyMenu } from '@root/components';
import { Routes } from '@root/consts';

import { useUserContext } from '../../hooks';

import { Image } from './styles';

const LobbyPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useRef<URLSearchParams | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const { currentUser } = useUserContext();
  const redirectTo = localStorage.getItem('finalRedirect');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    params.current = urlParams;
    setResponseError(errorParam);
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (redirectTo) {
        localStorage.setItem('redirectTo', redirectTo);
        localStorage.removeItem('finalRedirect');
        const { pathname, origin } = new URL(redirectTo);
        const [, , businessUnitId] = pathname.split('/');

        window.location.href = `${origin}/${currentUser.tenantName}/${Routes.BusinessUnits}/${businessUnitId}/login?auto=true`;
      }
    }
  }, [currentUser, redirectTo]);

  if (!currentUser || (currentUser && redirectTo)) {
    return null;
  }

  return (
    <Layouts.Box
      height="100%"
      as={Layouts.Flex}
      justifyContent="center"
      direction="column"
      alignItems="center"
    >
      <Helmet title={t('Titles.Lobby')} />
      <Layouts.Margin bottom="4" left="auto" right="auto">
        <Image alt={`Starlight ${t('Text.Logo')}`} src={StarlightLogo} />
      </Layouts.Margin>
      {responseError ? (
        <Typography variant="headerFour" color="alert">
          {decodeURIComponent(responseError)}
        </Typography>
      ) : null}
      <LobbyMenu />
    </Layouts.Box>
  );
};

export default observer(LobbyPage);
