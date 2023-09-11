import React from 'react';

import { Badge } from '../../../../common';
import { type InvoiceStatus } from '../../Invoices/types';

export const getBadgeByStatus = (status: InvoiceStatus) => {
  switch (status) {
    case 'open':
      return <Badge color="information">Open</Badge>;
    case 'closed':
      return <Badge color="success">Closed</Badge>;
    default:
      return null;
  }
};
