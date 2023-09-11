import React, { FC, useState } from 'react';

import ResetForm from './ResetForm';
import ResetSuccess from './ResetSuccess';
import LoginLayout, { LoginLayoutProps } from '../LoginView/LoginLayout';

export interface ResetViewProps {
  layout?: LoginLayoutProps;
}

const ResetView: FC<ResetViewProps> = ({ layout }) => {
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  return (
    <LoginLayout {...layout}>
      {showResetSuccess ? (
        <ResetSuccess />
      ) : (
        <ResetForm onSubmit={() => setShowResetSuccess(true)} />
      )}
    </LoginLayout>
  );
};

export default ResetView;
