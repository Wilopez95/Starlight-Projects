import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import Login from './Login';

export const LoginConfig: IRoute = {
  Component: Login,
  name: 'Login',
  path: Paths.Login,
  header: false,
  exact: true,
};
