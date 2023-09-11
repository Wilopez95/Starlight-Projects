import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ResourceLogin, ResourceLoginType } from '@root/api/lobby/types';
import { GlobalSettingsConfig } from '@root/assets';
import { Typography } from '@root/common';
import { Routes } from '@root/consts';
import { getDefaultLogo } from '@root/helpers';
import { useStores, useUserContext } from '@root/hooks';

import { hasUserTokensForResource } from '../UserProvider/UserProvider';

import LobbyMenuItem from './LobbyMenuItem';
import { SkeletonLobbyMenu } from './SkeletonLobbyMenu';

import styles from './css/styles.scss';

const I18N_PATH = 'components.LobbyMenu.Text.';

const RESOURCE_PANEL_FULL_HEIGHT = 350;

interface IProps {
  handleMenuClose?(): void;
}

const LobbyMenu: React.FC<IProps> = ({ handleMenuClose }) => {
  const { lobbyStore } = useStores();
  const { currentUser } = useUserContext();
  const { t } = useTranslation();
  const history = useHistory();

  const loading = lobbyStore.loading;

  useEffect(() => {
    if (lobbyStore.resourceLogins.length === 0) {
      lobbyStore.requestActiveResourceLogins();
    }
  }, [lobbyStore]);

  const handleMenuItemClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, item: ResourceLogin) => {
      if (item.targetType !== ResourceLoginType.HAULING) {
        return;
      }

      if (hasUserTokensForResource(`${Routes.BusinessUnits}/${item.id}`)) {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        handleMenuClose && handleMenuClose();

        history.push(`/${Routes.BusinessUnits}/${item.id}`);
      }
    },
    [history, handleMenuClose],
  );

  const getGradingLoginUrl = useCallback(
    (resourceLogin: ResourceLogin) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return `${process.env.RECYCLING_FE_URL!}/${currentUser!.tenantName}/recycling/${
        resourceLogin.id
      }/grading/login?auto=true`;
    },
    [currentUser],
  );

  const resourceLogins = lobbyStore.resourceLogins;
  const systemConfigResourceLogin = resourceLogins.find(({ id }) => id === 'systemConfig');
  const userBULogins = resourceLogins.filter(
    ({ targetType, hasRecyclingAccess, hasGradingAccess, graderHasBUAccess }) => {
      if (targetType === ResourceLoginType.HAULING) {
        return true;
      }

      return hasRecyclingAccess || (hasGradingAccess && graderHasBUAccess);
    },
  );

  const userGradingLogins = resourceLogins.filter(item => item.hasGradingAccess);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <SkeletonLobbyMenu />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {systemConfigResourceLogin ? (
        <LobbyMenuItem
          title="Global System Configuration"
          icon={<GlobalSettingsConfig />}
          path={systemConfigResourceLogin.loginUrl}
          onClick={event => {
            if (hasUserTokensForResource(Routes.Configuration)) {
              event.preventDefault();
              handleMenuClose?.();

              history.push(`/${Routes.Configuration}`);
            }
          }}
        />
      ) : null}
      {userBULogins.length ? (
        <div>
          <Typography as="h2" variant="headerFive" className={styles.chooseUnit}>
            {t(`${I18N_PATH}BusinessUnits`)}
          </Typography>
          <Layouts.Scroll
            rounded
            minHeight={75}
            maxHeight={
              userGradingLogins.length ? RESOURCE_PANEL_FULL_HEIGHT / 2 : RESOURCE_PANEL_FULL_HEIGHT
            }
          >
            {userBULogins.map(item => (
              <LobbyMenuItem
                key={item.id}
                title={item.label}
                address={item.subLabel}
                path={item.loginUrl}
                image={item.image}
                updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
                defaultLogo={getDefaultLogo(item.label || '')}
                onClick={event => handleMenuItemClick(event, item)}
              />
            ))}
          </Layouts.Scroll>
        </div>
      ) : null}
      {userGradingLogins.length ? (
        <>
          <Typography as="h2" variant="headerFive" className={styles.chooseUnit}>
            {t(`${I18N_PATH}Gradings`)}
          </Typography>
          <Layouts.Scroll rounded maxHeight={RESOURCE_PANEL_FULL_HEIGHT / 2}>
            {userGradingLogins.map(item => (
              <LobbyMenuItem
                key={item.id}
                title={item.label}
                address={item.subLabel}
                path={getGradingLoginUrl(item)}
                image={item.image}
                updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
                defaultLogo={getDefaultLogo(item.label || '')}
                onClick={event => handleMenuItemClick(event, item)}
              />
            ))}
          </Layouts.Scroll>
        </>
      ) : null}
    </div>
  );
};

export default observer(LobbyMenu);
