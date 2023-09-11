import React, { FC } from 'react';

import LoginLayout, { LoginLayoutProps } from './LoginLayout';
import LoginForm from './LoginForm';

export interface LoginViewProps {
  localStorageUserKey: string;
  layout?: LoginLayoutProps;
}

const LoginView: FC<LoginViewProps> = ({ localStorageUserKey, layout }) => {
  return (
    <LoginLayout {...layout}>
      <LoginForm localStorageUserKey={localStorageUserKey} />
    </LoginLayout>
  );
};

export default LoginView;
