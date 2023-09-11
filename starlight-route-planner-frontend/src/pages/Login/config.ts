import { IRoute } from '@root/types';

import FinishLoginPage from './FinishLogin';
import LoginPage from './Login';

export const LoginConfig: IRoute = {
  component: LoginPage,
  name: 'login page',
  path: '/login',
  header: false,
};

export const FinishLoginConfig: IRoute = {
  component: FinishLoginPage,
  name: 'finish login page',
  path: '/finish-login',
  header: false,
};
