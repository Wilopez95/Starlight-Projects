import * as React from 'react';
import { Redirect } from 'react-router-dom';

import { usePermission } from '@root/auth/hooks/permission/permission';

import { IProtected } from './types';

export const Protected: React.FC<IProtected> = ({ permissions, children }) => {
  const hasAccess = usePermission(permissions);

  if (!hasAccess) {
    return (
      <Redirect
        to={{
          pathname: '/login',
          state: { error: true },
        }}
      />
    );
  }

  return <>{children}</>;
};
