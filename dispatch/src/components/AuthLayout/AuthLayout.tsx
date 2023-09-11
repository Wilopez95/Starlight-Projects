import * as React from 'react';

import { LoginPage, Left, Right } from './styles';

type Props = {
  children: React.ReactNode;
};

export const AuthLayout: React.FC<Props> = ({ children }) => (
  <LoginPage>
    <Left />
    <Right>{children}</Right>
  </LoginPage>
);
