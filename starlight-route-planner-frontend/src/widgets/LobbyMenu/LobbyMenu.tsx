import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ResourceLoginType } from '@root/api/lobby/types';
import { Routes } from '@root/consts';
import { getDefaultLogo } from '@root/helpers';
import { useStores, useUserContext } from '@root/hooks';

import LobbyMenuItem from './LobbyMenuItem';

import styles from './css/styles.scss';

const LobbyMenu: React.FC = () => {
  const { lobbyStore } = useStores();
  const { hasUserTokensForResource } = useUserContext();
  const history = useHistory();

  useEffect(() => {
    if (lobbyStore.resourceLogins.length === 0) {
      lobbyStore.requestActiveResourceLogins();
    }
  }, [lobbyStore]);

  const resourceLogins = lobbyStore.resourceLogins;
  const userResourceLogins = resourceLogins.filter(
    ({ targetType }) =>
      targetType === ResourceLoginType.HAULING ||
      targetType === ResourceLoginType.RECYCLING_FACILITY,
  );

  return (
    <div className={styles.wrapper}>
      {userResourceLogins.length ? (
        <>
          <Typography variant="headerFive" className={styles.chooseUnit}>
            Choose Business Unit
          </Typography>
          <Layouts.Scroll rounded maxHeight={285}>
            {userResourceLogins.map(item => (
              <LobbyMenuItem
                key={item.id}
                title={item.label}
                address={item.subLabel}
                path={item.loginUrl}
                image={item.image}
                updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
                defaultLogo={getDefaultLogo(item.label || '')}
                onClick={event => {
                  if (item.targetType !== ResourceLoginType.HAULING) {
                    return;
                  }

                  if (hasUserTokensForResource(`${Routes.BusinessUnits}/${item.id}`)) {
                    event.preventDefault();

                    history.push(`/${Routes.BusinessUnits}/${item.id}`);
                  }
                }}
              />
            ))}
          </Layouts.Scroll>
        </>
      ) : null}
    </div>
  );
};

export default observer(LobbyMenu);
