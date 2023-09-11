import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Login from '@root/pages/Login/Login';
import FinishLogin from '@root/pages/Login/FinishLogin';
import { UnauthenticatedBusinessUnitLoginRedirect } from '@root/pages/UnauthenticatedBusinessUnitLoginRedirect';
import { SystemConfigurationLoginRedirect } from './SystemConfigurationLoginRedirect';
import { Paths } from './routing';

export const UnauthenticatedRoutes: React.FC = () => {
  return (
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
      <Route
        path={Paths.GlobalSystemConfigurationModule.UnauthenticatedRedirect}
      >
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
};
