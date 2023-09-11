import React, { useEffect, useRef, useState } from 'react';
import { Layouts, StarlightLogo, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { LobbyMenu } from '@root/widgets';

const LobbyPage: React.FC = () => {
  const { businessUnitStore } = useStores();
  const params = useRef<URLSearchParams | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const units = businessUnitStore.values;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    params.current = urlParams;
    setResponseError(errorParam);
  }, []);

  useEffect(() => {
    if (units.length === 0) {
      businessUnitStore.request();
    }
  }, [businessUnitStore, units]);

  return (
    <Layouts.Box
      height="100%"
      as={Layouts.Flex}
      justifyContent="center"
      direction="column"
      alignItems="center"
    >
      <Layouts.Margin bottom="4" left="auto" right="auto">
        <Layouts.IconLayout width="166px" height="55px">
          <StarlightLogo />
        </Layouts.IconLayout>
      </Layouts.Margin>
      {responseError && (
        <Typography variant="headerFour" color="alert">
          {decodeURIComponent(responseError)}
        </Typography>
      )}
      <LobbyMenu />
    </Layouts.Box>
  );
};

export default observer(LobbyPage);
