import React from 'react';
import { Route, Switch } from 'react-router';

import { Paths, RouteModules } from '@root/consts';
import LobbyPage from '@root/pages/LobbyPage/LobbyPage';
import FinishLogin from '@root/pages/Login/FinishLogin';
import Login from '@root/pages/Login/Login';
import { BusinessUnitRedirect } from '@root/pages/SystemConfiguration/BusinessUnitRedirect';
import { InitRegion } from '@root/widgets/InitRegion';

import { DefaultAuthenticatedRedirect } from './DefaultAuthenticatedRoute';
import { DispatcherModuleRoutes, MasterRouteGridModuleRoutes } from './modules';

export const AuthenticatedRoutes: React.FC = () => (
  <>
    <InitRegion />
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
      <Route path={Paths.GlobalSystemConfigurationModule.Login}>
        <Login />
      </Route>
      <Route path={Paths.GlobalSystemConfigurationModule.FinishLogin}>
        <FinishLogin />
      </Route>
      <Route path={RouteModules.Dispatch}>
        <DispatcherModuleRoutes />
      </Route>

      <Route path={RouteModules.MasterRouteGrid}>
        <MasterRouteGridModuleRoutes />
      </Route>

      <Route path="*">
        <DefaultAuthenticatedRedirect />
      </Route>
    </Switch>
  </>
);
