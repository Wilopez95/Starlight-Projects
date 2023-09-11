import React from 'react';
import { Badge } from '@starlightpro/shared-components';

import { InvoiceStatus } from '@root/finance/types/entities';

export const getBadgeByStatus = (status: InvoiceStatus) => {
  switch (status) {
    case 'open':
      return <Badge color='information'>Open</Badge>;
    case 'closed':
      return <Badge color='success'>Closed</Badge>;
    case 'overdue':
      return <Badge color='primary'>Overdue</Badge>;
    case 'writeOff':
      return <Badge color='alert'>Write Off</Badge>;
  }
};
