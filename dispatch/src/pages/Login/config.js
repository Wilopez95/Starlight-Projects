import FinishLoginPage from './FinishLogin';
import LoginPage from './Login';

export const LoginConfig = {
  component: LoginPage,
  name: 'login page',
  path: '/login',
  header: false,
};

export const FinishLoginConfig = {
  component: FinishLoginPage,
  name: 'finish login page',
  path: '/finish-login',
  header: false,
};
