import React from 'react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react-lite';

import { apiConfig } from '@root/config';
import { Paths, RouteModules } from '@root/consts';
import { useIsRecyclingFacilityBU, useUserContext } from '@root/hooks';

import {
  BaseProvider,
  DocumentTitle,
  DocumentTitleProvider,
  Modals,
  PrintNodeProvider,
  ScaleProvider,
  SidePanels,
} from './components';
import { theme } from './theme';

export const RecyclingProvider: React.FC = ({ children }) => {
  const { currentUser, userTokens } = useUserContext();
  const isOnGlobalConfiguration = useRouteMatch(RouteModules.SystemConfiguration);
  const isOnBUConfiguration = useRouteMatch(RouteModules.BusinessUnitConfiguration);

  const isOnScales = useRouteMatch(Paths.BusinessUnitConfigurationModule.Scales);
  const isOnOriginAndDestinations = useRouteMatch(
    Paths.BusinessUnitConfigurationModule.OriginsAndDestinations,
  );

  const isOnRecyclingConfiguration = !!isOnScales || !!isOnOriginAndDestinations;

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();
  const userInfo =
    currentUser && userTokens
      ? {
          firstName: currentUser.firstName,
          id: currentUser.id,
          lastName: currentUser.lastName,
          permissions: [...currentUser.permissions],
          resource: currentUser.resource,
          token: userTokens.token,
          email: currentUser.email,
        }
      : undefined;

  if (
    isOnGlobalConfiguration ||
    (isOnBUConfiguration && !isOnRecyclingConfiguration) ||
    !isRecyclingFacilityBU
  ) {
    return <>{children}</>;
  }

  return (
    <BaseProvider userInfo={userInfo} apiUrl={apiConfig.recyclingApiUrl} theme={theme}>
      <PrintNodeProvider>
        <ScaleProvider>
          <DocumentTitleProvider>
            <DocumentTitle />
            <SidePanels />
            <Modals />
            {children}
          </DocumentTitleProvider>
        </ScaleProvider>
      </PrintNodeProvider>
    </BaseProvider>
  );
};

export default observer(RecyclingProvider);
