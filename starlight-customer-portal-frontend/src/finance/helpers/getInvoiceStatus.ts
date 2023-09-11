import { isAfter, startOfToday } from 'date-fns';

import { IAppliedInvoice, IInvoice, InvoiceStatus } from '@root/finance/types/entities';

export const getInvoiceStatus = (invoice: IInvoice | IAppliedInvoice): InvoiceStatus => {
  const { balance, dueDate, writeOff } = invoice;

  if (writeOff) {
    return 'writeOff';
  }

  if (balance === 0) {
    return 'closed';
  }
  if (balance > 0 && dueDate && isAfter(startOfToday(), dueDate)) {
    return 'overdue';
  }

  return 'open';
};
