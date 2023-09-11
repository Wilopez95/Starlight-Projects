import React from 'react';

import { EntityName } from '@root/auth/hooks/permission/types';

export interface IRoute {
  name: string;
  entity?: EntityName;
  path: string;
  Component: React.FC<any>;
  header?: boolean | string | React.FC;
  exact?: boolean;
}
