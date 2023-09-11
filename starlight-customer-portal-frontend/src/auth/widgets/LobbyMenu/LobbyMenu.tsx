import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ResourceLoginType, ResourceLogin } from '@root/auth/api';
import { hasUserTokensForResource } from '@root/auth/providers/UserProvider/UserProvider';
import { Routes } from '@root/core/consts';
import { getDefaultLogo } from '@root/core/helpers';
import { useStores, useUserContext } from '@root/core/hooks';

import LobbyMenuItem from './LobbyMenuItem';

interface IProps {
  handleMenuClose?(): void;
}
const LobbyMenu: React.FC<IProps> = () => {
  const { lobbyStore } = useStores();
  const { logOut } = useUserContext();

  const history = useHistory();

  useEffect(() => {
    if (lobbyStore.resourceLogins.length === 0) {
      (async () => {
        const resources = await lobbyStore.requestActiveResourceLogins();
        if (resources?.length === 0) {
          logOut();
        }
      })();
    }
  }, [lobbyStore, logOut]);

  const handleMenuItemClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, item: ResourceLogin) => {
      if (hasUserTokensForResource(`${Routes.Customers}/${item.id}`)) {
        console.log('ENTRA');

        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        history.push(`/${Routes.Customers}/${item.id}/login?auto=true`);
      } else {
        console.log('NO ENTRA');
      }
    },
    [history],
  );

  const resourceLogins = lobbyStore.resourceLogins;
  const userResourceLogins =
    resourceLogins?.filter(({ targetType }) => targetType === ResourceLoginType.CP) ?? [];

  const { t } = useTranslation();

  const I18N_PATH = 'components.LobbyMenu.';

  return (
    <Layouts.Box width='620px' backgroundColor='white' borderRadius='4px'>
      <Layouts.Padding top='3' bottom='3' left='5' right='5'>
        {userResourceLogins.length ? (
          <>
            <Layouts.Margin top='2' bottom='1'>
              <Typography variant='headerThree'>{t(`${I18N_PATH}title`)}</Typography>
            </Layouts.Margin>
            <Layouts.Scroll maxHeight={285} overflowY='auto'>
              {userResourceLogins.map((item) => {
                return (
                  <LobbyMenuItem
                    key={item.id}
                    title={item.label}
                    address={item.subLabel}
                    path={`${item.loginUrl}/login?auto=true`}
                    // path='hola mundo'
                    image={item.image}
                    updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
                    defaultLogo={getDefaultLogo(item.label || '')}
                    onClick={(event) => handleMenuItemClick(event, item)}
                    // onClick={(event) => console.log(event)}
                  />
                );
              })}
            </Layouts.Scroll>
          </>
        ) : null}
      </Layouts.Padding>
    </Layouts.Box>
  );
};

export default observer(LobbyMenu);
