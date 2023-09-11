import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import Statements from './Statements';

export const StatementsConfig: IRoute = {
  name: 'Statements',
  entity: 'statements',
  Component: Statements,
  path: Paths.Statements,
  header: true,
  exact: true,
};
