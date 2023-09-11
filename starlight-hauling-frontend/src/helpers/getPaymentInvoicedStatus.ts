/* eslint-disable default-case */
import { Colors } from '@starlightpro/shared-components';

import { InvoicedStatus } from '@root/modules/billing/types';

export const getPaymentInvoicedStatusColor = (status: InvoicedStatus): Partial<Colors> => {
  switch (status) {
    case 'applied':
      return 'success';
    case 'unapplied':
      return 'primary';
    case 'reversed':
      return 'alert';
  }
};
