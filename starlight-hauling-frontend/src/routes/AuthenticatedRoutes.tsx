import React from 'react';
import { Route, Switch } from 'react-router';

import { InitRegion } from '@root/components/InitRegion';
import { ClockInModal } from '@root/components/modals';
import { Paths, RouteModules } from '@root/consts';
import LobbyPage from '@root/pages/LobbyPage/LobbyPage';
import FinishLogin from '@root/pages/Login/FinishLogin';
import Login from '@root/pages/Login/Login';
import { BusinessUnitRedirect } from '@root/pages/SystemConfiguration/BusinessUnitRedirect';
import { SystemConfigurationRedirect } from '@root/pages/SystemConfiguration/SystemConfigurationRedirect';

import { DefaultAuthenticatedRedirect } from './DefaultAuthenticatedRoute';
import {
  BusinessUnit,
  BusinessUnitConfigurationModuleRoutes,
  NewRequestModuleRoutes,
  ReportsModuleRoutes,
  SystemConfigurationModuleRoutes,
} from './modules';

export const AuthenticatedRoutes: React.FC = () => (
  <>
    <InitRegion />
    <ClockInModal />
    <Switch>
      <Route path={Paths.LobbyFinishLogin}>
        <FinishLogin />
      </Route>
      <Route path={Paths.LobbyLogin}>
        <Login />
      </Route>
      <Route path={Paths.Lobby}>
        <LobbyPage />
      </Route>
      <Route path={Paths.BusinessUnitLogin.FinishLogin}>
        <FinishLogin />
      </Route>
      <Route path={Paths.BusinessUnitLogin.Login}>
        <Login />
      </Route>
      <Route path={Paths.BusinessUnitLogin.LoginRedirect} exact>
        <BusinessUnitRedirect />
      </Route>
      <Route path={Paths.SystemConfigurationModule.LoginRedirect} exact>
        <SystemConfigurationRedirect />
      </Route>
      <Route path={Paths.SystemConfigurationModule.Login}>
        <Login />
      </Route>
      <Route path={Paths.SystemConfigurationModule.FinishLogin}>
        <FinishLogin />
      </Route>
      <Route path={RouteModules.Request}>
        <NewRequestModuleRoutes />
      </Route>
      <Route path={RouteModules.SystemConfiguration}>
        <SystemConfigurationModuleRoutes />
      </Route>
      <Route path={RouteModules.BusinessUnitConfigurationFull}>
        <BusinessUnitConfigurationModuleRoutes />
      </Route>
      <Route path={RouteModules.Reports}>
        <ReportsModuleRoutes />
      </Route>
      <Route path={RouteModules.BusinessUnit} exact={false}>
        <BusinessUnit />
      </Route>

      <Route path="*">
        <DefaultAuthenticatedRedirect />
      </Route>
    </Switch>
  </>
);
