import React from 'react';

import { TableTools } from '@root/common/TableTools';

export const TableHeader: React.FC = () => {
  return (
    <TableTools.Header>
      <TableTools.HeaderCell>Start Date</TableTools.HeaderCell>
      <TableTools.HeaderCell>#</TableTools.HeaderCell>
      <TableTools.HeaderCell>Line of Business</TableTools.HeaderCell>
      <TableTools.HeaderCell>Service</TableTools.HeaderCell>
      <TableTools.HeaderCell>Service Frequency</TableTools.HeaderCell>
      <TableTools.HeaderCell>Next Service Date</TableTools.HeaderCell>
      <TableTools.HeaderCell>Customer</TableTools.HeaderCell>
      <TableTools.HeaderCell>Payment</TableTools.HeaderCell>
      <TableTools.HeaderCell right>Price Per Billing Cycle, $</TableTools.HeaderCell>
      <TableTools.HeaderCell>Billing Cycle</TableTools.HeaderCell>
    </TableTools.Header>
  );
};
