import * as React from 'react';
import { Loadable } from '@starlightpro/shared-components';

import { useUserContext } from '@root/auth/hooks/useUserContext';
import { UnauthenticatedRoutes } from './UnauthenticatedRoutes';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';

export const AppRoutes: React.FC = () => {
  const { currentUser, isLoading } = useUserContext();
  if (isLoading) {
    return <Loadable />;
  }

  if (!currentUser) {
    return <UnauthenticatedRoutes />;
  }

  return <AuthenticatedRoutes />;
};
