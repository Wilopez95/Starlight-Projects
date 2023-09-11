import EmailLog from './EmailLog/EmailLog';
import OrdersTable from './Orders/Orders';
import PaymentsTable from './Payments/Payments';
import SubscriptionsTable from './Subscriptions/Subscriptions';
import { InvoiceQuickViewTabs } from './types';

export const getCurrentTable = (currentTab: InvoiceQuickViewTabs) => {
  switch (currentTab) {
    case InvoiceQuickViewTabs.Orders:
      return OrdersTable;
    case InvoiceQuickViewTabs.Subscriptions:
      return SubscriptionsTable;
    case InvoiceQuickViewTabs.Payments:
      return PaymentsTable;
    case InvoiceQuickViewTabs.EmailLog:
      return EmailLog;
    default:
      return null;
  }
};
