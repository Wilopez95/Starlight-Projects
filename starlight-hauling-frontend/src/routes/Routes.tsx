import React from 'react';

import { Loadable } from '@root/common';
import { useUserContext } from '@root/hooks';

import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { UnauthenticatedRoutes } from './UnauthenticatedRoutes';

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
