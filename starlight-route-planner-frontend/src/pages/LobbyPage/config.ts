import { Paths } from '@root/consts';
import { IRoute } from '@root/types';

import FinishLogin from '../Login/FinishLogin';
import Login from '../Login/Login';

import LobbyPage from './LobbyPage';

export const LobbyPageConfig: IRoute = {
  component: LobbyPage,
  name: 'Lobby Page',
  path: Paths.Lobby,
  header: false,
  exact: false,
};

export const LobbyLoginPageConfig: IRoute = {
  component: Login,
  name: 'Lobby Login Page',
  path: `${Paths.Lobby}/login`,
  header: false,
  exact: false,
};

export const LobbyFinishLoginPageConfig: IRoute = {
  component: FinishLogin,
  name: 'Lobby Finish Login Page',
  path: `${Paths.Lobby}/finish-login`,
  header: false,
  exact: false,
};
