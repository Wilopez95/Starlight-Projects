import React from 'react';

import type { ICustomer } from '../../../types';

import InvoiceBuilder from './InvoiceBuilder';

export default {
  title: 'InvoiceBuilder',
};

const customer: ICustomer = {
  id: 1,
  invoiceConstruction: 'byAddress',
  paymentTerms: 'net15Days',
  billingAddress: {
    addressLine1: '1001 Spruce Street',
    addressLine2: null,
    city: 'Denver',
    state: 'CO',
    zip: '80230',
  },
};

const orders = [
  {
    id: 1,
    serviceDate: new Date(),
    beforeTaxesTotal: 350,
    grandTotal: 400,
    jobSite: {
      addressLine1: '790 Poplar Street',
      addressLine2: 'St 2345',
      city: 'Denver',
      state: 'CO',
      zip: '80220',
    },
    woNumber: 2321,
    ticket: '3145',
    services: [
      { quantity: 3, price: 50, description: '10YD Switch' },
      { quantity: 2, price: 100, description: 'Deposit' },
    ],
  },
  {
    id: 2,
    serviceDate: new Date(),
    beforeTaxesTotal: 350,
    grandTotal: 400,
    jobSite: {
      addressLine1: '790 Fairfax Street',
      addressLine2: 'St 1',
      city: 'Los Angeles',
      state: 'CO',
      zip: '80220',
    },
    woNumber: 3,
    ticket: '565',
    services: [
      { quantity: 3, price: 50, description: '10YD Delivery' },
      { quantity: 2, price: 100, description: 'Cash back' },
    ],
  },
];

export const Preview: React.FC = () => (
  <div style={{ width: '600px' }}>
    <InvoiceBuilder preview customer={customer} orders={orders} payments={100} />
  </div>
);

export const ByCustomer: React.FC = () => (
  <div style={{ width: '600px' }}>
    <InvoiceBuilder
      preview
      customer={{ ...customer, invoiceConstruction: 'byCustomer' }}
      orders={orders}
      payments={0}
    />
  </div>
);

export const FullScreen: React.FC = () => (
  <InvoiceBuilder customer={customer} orders={orders} payments={0} />
);
