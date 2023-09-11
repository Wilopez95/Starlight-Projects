import React from 'react';

import { usePermission } from '@root/hooks';

import { IProtected } from './types';

export const Protected: React.FC<IProtected> = ({ permissions, fallback = null, children }) => {
  const hasAccess = usePermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
