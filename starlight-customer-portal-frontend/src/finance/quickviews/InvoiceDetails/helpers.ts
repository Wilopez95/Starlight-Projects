import { InvoiceQuickViewTabs } from '@root/finance/quickviews/InvoiceDetails/types';

import OrdersTable from './Orders/Orders';
import PaymentsTable from './Payments/Payments';
import Subscriptions from './Subscriptions/Subscriptions';

export const getCurrentTable = (currentTab: InvoiceQuickViewTabs) => {
  switch (currentTab) {
    case InvoiceQuickViewTabs.Orders:
      return OrdersTable;
    case InvoiceQuickViewTabs.Subscriptions:
      return Subscriptions;
    case InvoiceQuickViewTabs.Payments:
      return PaymentsTable;
  }
};
