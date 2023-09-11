import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Badge } from '@root/common';

import { SubjectRow } from '../../BaseRows';

export const OrderHistoryInvoiceAddedChanges: React.FC<{ invoiceId: number }> = ({ invoiceId }) => {
  return (
    <SubjectRow subject="Order">
      added to Invoice
      <Layouts.Margin left="0.5">
        <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
          #{invoiceId}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
