import { gql } from '@apollo/client';
import { Trans, useTranslation } from '../../i18n';
import React, { useState } from 'react';
import cs from 'classnames';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Box, IconButton, Menu } from '@material-ui/core';

import GlobalSettingsConfigIcon from './GlobalSystemConfigIcon';
import LobbyMenuItem from './LobbyMenuItem';
import { LobbyMenuSkeleton } from './LobbyMenuSkeleton';
import GlobalMenuIcon from './GlobalMenuIcon';

import { useResourceLoginsQuery } from '../../graphql/api';
import { HAULING_FE_HOST } from '@starlightpro/common/constants';

const haulingUrl = `${window.location.protocol}//${HAULING_FE_HOST}`;

export const GET_USER_RESOURCES_SCHEMA = gql`
  query resourceLogins {
    resourceLogins {
      id
      label
      subLabel
      loginUrl
      image
      updatedAt
      targetType
      hasGradingAccess
      hasRecyclingAccess
      tenantName
    }
  }
`;

export enum ResourceLoginType {
  GLOBAL = 'globalSystem',
  RECYCLING_FACILITY = 'recyclingFacility',
  HAULING = 'hauling/crpt',
}

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    menu: {
      maxHeight: 542,
      maxWidth: 620,
      width: '100%',
      height: '100%',
      borderRadius: 4,
      padding: spacing(2, 5),
    },
    scrollContainer: {
      maxHeight: 175,
      minHeight: 75,
      overflowX: 'auto',
    },
    bottomSpace: {
      marginBottom: spacing(1),
    },
    topSpace: {
      marginTop: spacing(1),
    },
    menuOpenButton: {
      color: palette.common.white,
      marginRight: spacing(1.5),
    },
    buChooseLabel: {
      fontWeight: 'bold',
    },
    globalSettingsItem: {
      marginBottom: spacing(2),
    },
    noDecoration: {
      textDecoration: 'none',
      color: 'inherit',
    },
  }),
  { name: 'LobbyMenu' },
);

export const LobbyMenu: React.FC = () => {
  const classes = useStyles();
  const [t] = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data, loading } = useResourceLoginsQuery();
  const origin = window.location.origin;

  const resourceLogins = data?.resourceLogins || [];
  const systemConfigResourceLogin = resourceLogins.find(({ id }) => id === 'systemConfig');
  const userResourceLogins = resourceLogins.filter(
    (item) => item.targetType !== ResourceLoginType.GLOBAL,
  );
  const userGradingLogins = resourceLogins.filter((item) => item.hasGradingAccess);
  const userRecyclingLogins = resourceLogins.filter((item) => item.hasRecyclingAccess);

  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const recyclingLoginUrl = (loginUrl: string) => loginUrl.replace('business-units', 'recycling');

  const getRedirectUrl = ({
    tenantName,
    id,
    screen = 'console',
  }: {
    id: string;
    targetType: ResourceLoginType;
    screen?: string;
    tenantName?: string;
  }) => `${origin}/${tenantName}/recycling/${id}/${screen}`;

  const bussinessUnitsItems = [];
  let systemConfigItem;
  const gradingItems = [];

  if (systemConfigResourceLogin && HAULING_FE_HOST) {
    const systemConfigResourceUrl = `${haulingUrl}${systemConfigResourceLogin.loginUrl}`;

    systemConfigItem = (
      <a
        key={systemConfigResourceUrl}
        href={systemConfigResourceUrl}
        className={classes.noDecoration}
      >
        <LobbyMenuItem
          key="system-config"
          title={t('Global System Configuration')}
          icon={<GlobalSettingsConfigIcon />}
          className={cs({ [classes.globalSettingsItem]: userResourceLogins.length })}
          onClick={(e) => {
            e.preventDefault();

            window.location.href = systemConfigResourceUrl;
          }}
        />
      </a>
    );
  }

  if (userResourceLogins.length <= 1) {
    return null;
  }

  if (userRecyclingLogins.length) {
    const recyclingBUs = userRecyclingLogins.map((item) => {
      const redirectTo = getRedirectUrl({
        id: item.id,
        targetType: item.targetType as ResourceLoginType,
        tenantName: item.tenantName || undefined,
        screen: 'console',
      });

      return (
        <a key={redirectTo} href={redirectTo} className={classes.noDecoration}>
          <LobbyMenuItem
            key={`${item.loginUrl}BUs`}
            title={item.label}
            subtitle={item.subLabel || undefined}
            image={item.image}
            updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
            onClick={(e) => {
              e.preventDefault();

              localStorage.setItem('redirectTo', redirectTo);
              window.location.assign(recyclingLoginUrl(item.loginUrl));
            }}
          />
        </a>
      );
    });

    bussinessUnitsItems.push(...recyclingBUs);
  }

  if (userGradingLogins.length) {
    const gradingBUs = userGradingLogins.map((item) => {
      const redirectTo = getRedirectUrl({
        id: item.id,
        targetType: item.targetType as ResourceLoginType,
        tenantName: item.tenantName || undefined,
        screen: 'grading',
      });

      return (
        <a key={redirectTo} href={redirectTo} className={classes.noDecoration}>
          <LobbyMenuItem
            key={`${item.loginUrl}gradings`}
            title={item.label}
            subtitle={item.subLabel || undefined}
            image={item.image}
            updatedAt={item.updatedAt ? new Date(item.updatedAt) : new Date()}
            onClick={(e) => {
              e.preventDefault();

              localStorage.setItem('redirectTo', redirectTo);
              window.location.assign(recyclingLoginUrl(item.loginUrl));
            }}
          />
        </a>
      );
    });

    gradingItems.push(...gradingBUs);
  }

  return (
    <>
      <IconButton className={classes.menuOpenButton} onClick={handleOpen}>
        <GlobalMenuIcon />
      </IconButton>
      <Menu
        PopoverClasses={{ paper: classes.menu }}
        open={isOpen}
        anchorEl={anchorEl}
        anchorPosition={{
          left: 0,
          top: 80,
        }}
        anchorReference="anchorPosition"
        onClose={handleClose}
      >
        {loading ? (
          <LobbyMenuSkeleton />
        ) : (
          <div>
            {systemConfigItem && <Box className={classes.scrollContainer}>{systemConfigItem}</Box>}
            {bussinessUnitsItems.length ? (
              <>
                <Typography
                  key="chooseBU"
                  variant="body2"
                  className={cs(classes.bottomSpace, classes.buChooseLabel)}
                >
                  <Trans>Business Units</Trans>
                </Typography>

                <Box className={classes.scrollContainer}>{bussinessUnitsItems}</Box>
              </>
            ) : null}
            {gradingItems.length ? (
              <>
                <Typography
                  key="choose-grading"
                  variant="body2"
                  className={cs(classes.bottomSpace, classes.topSpace, classes.buChooseLabel)}
                >
                  <Trans>Gradings</Trans>
                </Typography>
                <Box className={classes.scrollContainer}>{gradingItems}</Box>
              </>
            ) : null}
          </div>
        )}
      </Menu>
    </>
  );
};
