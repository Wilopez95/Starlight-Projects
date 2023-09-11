import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import LobbyPage from './LobbyPage';

export const LobbyPageConfig: IRoute = {
  Component: LobbyPage,
  name: 'Lobby Page',
  path: Paths.Lobby,
  header: false,
  exact: true,
};
