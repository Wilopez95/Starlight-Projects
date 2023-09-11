import React from 'react';
import { Loadable } from '@starlightpro/shared-components';

import { AuthenticatedRoutes } from '@root/app/container/AuthenticatedRoutes';
import { useUserContext } from '@root/core/hooks';

import { UnauthenticatedRoutes } from './UnauthenticatedRoutes';

export const Routes: React.FC = () => {
  const { currentUser, isLoading } = useUserContext();

  if (isLoading) {
    return <Loadable />;
  }

  if (!currentUser) {
    return <UnauthenticatedRoutes />;
  }

  return <AuthenticatedRoutes />;
};
