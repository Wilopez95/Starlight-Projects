import { useEffect, useRef } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { Box, Flex, Margin } from '@starlightpro/shared-components';
import { Image } from '../../pages/Login/styles';
import LobbyMenu from '../LobbyMenu/LobbyMenu';

import { toast } from '../Toast';

const LobbyPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useRef<URLSearchParams | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam == 'true') {
      toast.error("You don't have sufficient permission", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
    params.current = urlParams;
  }, []);

  return (
    <Box
      height="100%"
      as={Flex}
      justifyContent="center"
      direction="column"
      alignItems="center"
    >
      <Helmet title="Lobby" />
      <Margin left="auto" right="auto" bottom="auto" top="5">
        <Image
          alt={`Starlight ${t('Text.Logo')}`}
          src="https://cdn.starlightpro.com/starlight-logo-plain.png"
        />
      </Margin>
      <LobbyMenu />
    </Box>
  );
};

export default observer(LobbyPage);
