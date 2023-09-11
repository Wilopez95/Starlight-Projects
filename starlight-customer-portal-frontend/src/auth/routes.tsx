import React from 'react';

import { LobbyPageConfig } from '@root/auth/pages/LobbyPage/config';
import { LoginConfig } from '@root/auth/pages/Login/config';
import { Paths } from '@root/core/consts';
import type { IRoute } from '@root/core/types';
import { DefaultRedirect } from '@root/core/widgets';

const defaultAuthenticated: IRoute = {
  name: '404',
  Component: () => <DefaultRedirect to={Paths.Lobby} />,
  path: '*',
  exact: false,
  header: false,
};

const defaultNonAuthenticated: IRoute = {
  name: '404',
  Component: () => <DefaultRedirect to={Paths.Login} />,
  path: '*',
  exact: false,
  header: false,
};

export const unauthenticatedRoutes: IRoute[] = [LoginConfig, defaultNonAuthenticated];
export const authenticatedRoutes: IRoute[] = [LobbyPageConfig, defaultAuthenticated];
