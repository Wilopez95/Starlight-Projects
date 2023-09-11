import React from 'react';

import { Badge } from '../../../../../../common';
import { InvoiceEmailStatus } from '../../../../Invoices/types';

export const getBadgeByStatus = (status: InvoiceEmailStatus) => {
  switch (status) {
    case InvoiceEmailStatus.Pending:
      return <Badge color="grey">Pending</Badge>;
    case InvoiceEmailStatus.Sent:
      return <Badge color="secondary">Sent</Badge>;
    case InvoiceEmailStatus.Delivered:
      return <Badge color="success">Delivered</Badge>;
    case InvoiceEmailStatus.FailedToDeliver:
      return <Badge color="alert">Failed to deliver</Badge>;
    case InvoiceEmailStatus.FailedToSend:
      return <Badge color="alert">Failed to send</Badge>;
    default:
      return null;
  }
};
