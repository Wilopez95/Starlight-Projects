import React from 'react';

import { CustomerNavItem } from '@root/modules/billing/Invoices/components/GenerateInvoicesQuickView/components';

import { ICustomerWithFinalChargeDraft } from '../../../../../types';

export const mapCustomerToNavItem = (customer: ICustomerWithFinalChargeDraft, index: number) => ({
  label: (
    <CustomerNavItem
      name={customer.businessName ?? `${customer.firstName} ${customer.lastName}`}
      address={customer.billingAddress}
      invoicesCount={customer.invoices.length}
    />
  ),
  index,
  key: customer.id.toString(),
  customer,
});
