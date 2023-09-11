import EmailLog from './EmailLog/EmailLog';
import InvoicesTable from './Invoices/Invoices';
import PaymentsTable from './Payments/Payments';
import { type FinanceChargeQuickViewTabs } from './types';

export const getCurrentTable = (currentTab: FinanceChargeQuickViewTabs) => {
  switch (currentTab) {
    case 'invoices':
      return InvoicesTable;
    case 'payments':
      return PaymentsTable;
    case 'emailLog':
      return EmailLog;
    default:
      return null;
  }
};
