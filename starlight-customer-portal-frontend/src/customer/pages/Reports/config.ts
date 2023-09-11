import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import ReportsPage from './Reports';

export const ReportsConfig: IRoute = {
  name: 'Reports',
  entity: 'reports',
  Component: ReportsPage,
  path: Paths.Reports,
  header: true,
  exact: true,
};
