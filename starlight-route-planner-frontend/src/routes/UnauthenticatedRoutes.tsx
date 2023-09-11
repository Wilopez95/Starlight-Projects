import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import { Paths } from '@root/consts';
import FinishLogin from '@root/pages/Login/FinishLogin';
import Login from '@root/pages/Login/Login';
import { SystemConfigurationLoginRedirect } from '@root/pages/SystemConfiguration/SystemConfigurationLoginRedirect';
import { UnauthenticatedBusinessUnitLoginRedirect } from '@root/pages/SystemConfiguration/UnauthenticatedBusinessUnitLoginRedirect';

export const UnauthenticatedRoutes: React.FC = () => (
  <Switch>
    <Route path={Paths.BusinessUnitLogin.FinishLogin}>
      <FinishLogin />
    </Route>
    <Route path={Paths.BusinessUnitLogin.Login}>
      <Login />
    </Route>
    <Route path={Paths.BusinessUnitLogin.UnauthenticatedRedirect}>
      <UnauthenticatedBusinessUnitLoginRedirect />
    </Route>
    <Route path={Paths.GlobalSystemConfigurationModule.Login}>
      <Login />
    </Route>
    <Route path={Paths.GlobalSystemConfigurationModule.FinishLogin}>
      <FinishLogin />
    </Route>
    <Route path={Paths.GlobalSystemConfigurationModule.LoginRedirect}>
      <SystemConfigurationLoginRedirect />
    </Route>
    <Route path={Paths.LobbyFinishLogin}>
      <FinishLogin />
    </Route>
    <Route path={Paths.LobbyLogin}>
      <Login />
    </Route>
    <Route path={Paths.Login} exact>
      <Login />
    </Route>
    <Route path="*">
      <Redirect to={Paths.Login} />
    </Route>
  </Switch>
);
