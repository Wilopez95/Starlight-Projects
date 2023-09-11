import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { LobbyMenu } from '@root/auth/widgets';
import { useStores, useUserContext } from '@root/core/hooks';

import { LogoImage } from './styles';

const LobbyPage: React.FC = () => {
  const { currentUser } = useUserContext();
  const history = useHistory();
  const { lobbyStore } = useStores();
  const params = useRef<URLSearchParams | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (lobbyStore.resourceLogins?.length === 1) {
      history.push(`${lobbyStore.resourceLogins[0].loginUrl}/login?auto=true`);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    params.current = urlParams;
    setResponseError(errorParam);
  }, [history, lobbyStore.resourceLogins]);

  return (
    <Layouts.Flex
      as={Layouts.Box}
      height='100%'
      alignItems='center'
      justifyContent='center'
      direction='column'
    >
      <Helmet title={t('Titles.Lobby')} />

      <Layouts.Margin bottom='4'>
        <LogoImage src={currentUser?.company?.logoUrl as string} alt={'tenant logo'} />
      </Layouts.Margin>
      {responseError && (
        <Typography variant='headerFour' color='alert'>
          {decodeURIComponent(responseError)}
        </Typography>
      )}
      <LobbyMenu />
    </Layouts.Flex>
  );
};

export default observer(LobbyPage);
