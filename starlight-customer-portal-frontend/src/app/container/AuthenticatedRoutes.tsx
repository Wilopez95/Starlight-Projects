import React from 'react';
import { Route, Switch } from 'react-router';

import LobbyPage from '@root/auth/pages/LobbyPage/LobbyPage';
import FinishLogin from '@root/auth/pages/Login/FinishLogin';
import Login from '@root/auth/pages/Login/Login';
import { customerPath, Paths } from '@root/core/consts';
import { CustomerRedirect } from '@root/customer/pages/CustomerRedirect';
import { CustomerModuleRoutes } from '@root/customer/routes';

import { DefaultAuthenticatedRedirect } from './DefaultAuthenticatedRoute';

export const AuthenticatedRoutes: React.FC = () => (
  <>
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

      <Route path={Paths.CustomerLogin.FinishLogin}>
        <FinishLogin />
      </Route>
      <Route path={Paths.CustomerLogin.Login}>
        <Login />
      </Route>
      <Route path={Paths.CustomerLogin.LoginRedirect} exact>
        <CustomerRedirect />
      </Route>

      <Route path={customerPath}>
        <CustomerModuleRoutes />
      </Route>

      <Route path='*'>
        <DefaultAuthenticatedRedirect />
      </Route>
    </Switch>
  </>
);
