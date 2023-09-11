import React, { FC } from 'react';

import ResetPasswordForm from './ResetPasswordForm';
import LoginLayout, { LoginLayoutProps } from '../LoginView/LoginLayout';

export interface LoginViewProps {
  layout?: LoginLayoutProps;
}

const ResetPasswordView: FC<LoginViewProps> = ({ layout }) => {
  return (
    <LoginLayout {...layout}>
      <ResetPasswordForm />
    </LoginLayout>
  );
};

export default ResetPasswordView;
