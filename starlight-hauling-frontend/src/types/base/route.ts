import React from 'react';
import { ISubscriptionTable } from '../../components/SubscriptionTable/types';

export interface IRoute {
  name: string;
  path: string;
  component: React.FC<ISubscriptionTable>;
  header?: boolean | string | React.FC;
  exact?: boolean;
}
