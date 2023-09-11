import React from 'react';

import { Badge } from '../../../../../../../common';
import { StatementEmailStatus } from '../../../../types';

export const getBadgeByStatus = (status: StatementEmailStatus) => {
  switch (status) {
    case StatementEmailStatus.Pending:
      return <Badge color="grey">Pending</Badge>;
    case StatementEmailStatus.Sent:
      return <Badge color="secondary">Sent</Badge>;
    case StatementEmailStatus.Delivered:
      return <Badge color="success">Delivered</Badge>;
    case StatementEmailStatus.FailedToDeliver:
      return <Badge color="alert">Failed to deliver</Badge>;
    case StatementEmailStatus.FailedToSend:
      return <Badge color="alert">Failed to send</Badge>;
    default:
      return null;
  }
};
