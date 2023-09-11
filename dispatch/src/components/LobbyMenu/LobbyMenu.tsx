/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Formik } from 'formik';
import { connect } from 'react-redux';
import {
  Box,
  getDefaultLogo,
  GlobalSettingsConfig,
  Margin,
  Padding,
  Scroll,
  Typography,
} from '@starlightpro/shared-components';

import { Paths, Routes } from '@root/routes/routing';
import { getAvailableResourceLogins } from '@root/state/modules/lobby';
import { hasUserTokensForResource } from '@root/providers/UserProvider/UserProvider';
import { Wrapper } from './styles';
import LobbyMenuItem from './LobbyMenuItem';
import { SkeletonLobbyMenu } from './SkeletonLobbyMenu';

const LobbyMenu: React.FC = ({
  state: { isLoading, data = [], status },
  getBusinessUnits,
}: any) => {
  const history = useHistory();
  useEffect(() => {
    if (history.location.pathname === `/${Routes.Lobby}`) {
      localStorage.setItem('currentBU', 'lobby');
    }
    if (data && data.length === 0) {
      getBusinessUnits();
    }
    if (status === 'FAILURE') {
      history.push(`/${Routes.Login}`);
    }
  }, [data, status]);
  if (isLoading || !data) {
    return (
      <Wrapper>
        <SkeletonLobbyMenu />
      </Wrapper>
    );
  }

  return (
    // @ts-expect-error
    <Formik>
      <Box
        width="620px"
        backgroundColor="white"
        borderRadius="4px"
        position="absolute"
      >
        <Padding bottom="2" left="3" right="3">
          {Object.keys(data).map((elem: any) => {
            const item: any = Object.values(data)[elem];
            return (
              item.id === 'systemConfig' && (
                <Margin top="1" key={item.id}>
                  <LobbyMenuItem
                    title="Global System Configuration"
                    icon={<GlobalSettingsConfig />}
                    path={item.loginUrl}
                    onClick={event => {
                      localStorage.setItem('currentBU', item.id);
                      if (
                        hasUserTokensForResource(`/${Routes.Configuration}`)
                      ) {
                        event.preventDefault();

                        history.push(`/${Paths.Configuration}`);
                      }
                    }}
                  />
                </Margin>
              )
            );
          })}
          {Object.keys(data ?? {}).length > 0 ? (
            <>
              <Margin top="1" bottom="1" left="1">
                <Typography style={{ fontSize: '14px' }} fontWeight="bold">
                  {'Business Units'}
                </Typography>
              </Margin>
              <Scroll maxHeight={285} overflowY="auto">
                {Object.keys(data).map((elem: any, index) => {
                  const item: any = Object.values(data)[elem];
                  return (
                    item.id !== 'systemConfig' && (
                      <LobbyMenuItem
                        key={item.id}
                        title={item.label}
                        address={item.subLabel}
                        path={item.loginUrl}
                        image={item.image}
                        updatedAt={
                          item.updatedAt ? new Date(item.updatedAt) : new Date()
                        }
                        isFirstItem={index === 1}
                        defaultLogo={getDefaultLogo(item.label || '')}
                        onClick={event => {
                          localStorage.setItem('currentBU', item.id);
                          localStorage.setItem('tenantName', item.tenantName);
                          if (
                            hasUserTokensForResource(
                              `${Routes.BusinessUnits}/${item.id}`,
                            )
                          ) {
                            event.preventDefault();

                            history.push(`/${Routes.BusinessUnits}/${item.id}`);
                          }
                        }}
                      />
                    )
                  );
                })}
              </Scroll>
            </>
          ) : null}
        </Padding>
      </Box>
    </Formik>
  );
};

const mapStateToProps = (state: any) => {
  return {
    state: state.lobby,
  };
};
const mapDispatchToProps = (dispatch: any) => ({
  getBusinessUnits: dispatch(getAvailableResourceLogins()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyMenu);
