import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import FinishLogin from '@root/auth/pages/Login/FinishLogin';
import Login from '@root/auth/pages/Login/Login';
import { Paths } from '@root/core/consts';
import { UnauthenticatedCustomerLoginRedirect } from '@root/customer/pages/UnauthenticatedCustomerLoginRedirect';

export const UnauthenticatedRoutes: React.FC = () => (
  <Switch>
    <Route path={Paths.LobbyFinishLogin}>
      <FinishLogin />
    </Route>
    <Route path={Paths.LobbyLogin}>
      <Login />
    </Route>
    <Route path={Paths.Login} exact>
      <Login />
    </Route>

    <Route path={Paths.CustomerLogin.FinishLogin}>
      <FinishLogin />
    </Route>
    <Route path={Paths.CustomerLogin.Login}>
      <Login />
    </Route>
    <Route path={Paths.CustomerLogin.UnauthenticatedRedirect}>
      <UnauthenticatedCustomerLoginRedirect />
    </Route>

    <Route path='*'>
      <Redirect to={Paths.Login} />
    </Route>
  </Switch>
);
