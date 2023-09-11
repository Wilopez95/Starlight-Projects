import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import InvoicesPage from './Invoices';

export const OrdersPageConfig: IRoute = {
  Component: InvoicesPage,
  name: 'Invoices',
  entity: 'invoices',
  path: Paths.Invoices,
  header: true,
  exact: true,
};
