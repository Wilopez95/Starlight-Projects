import React from 'react';

import type { ICustomer } from '../../../types';

import ReceiptBuilder from './ReceiptBuilder';
import type { OrderPayment } from './types';

export default {
  title: 'ReceiptBuilder',
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

const order = {
  id: 1,
  serviceDate: new Date(),
  payment: '5555555555554444',
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
  surchargesTotal: 0,
};

const payment: OrderPayment = {
  paymentMethod: 'check',
  paymentIdentifier: 'qweq123',
  amount: 200,
  date: new Date(),
};

export const Preview: React.FC = () => (
  <div style={{ width: '600px' }}>
    <ReceiptBuilder preview customer={customer} order={order} payment={payment} />
  </div>
);

export const FullScreen: React.FC = () => (
  <ReceiptBuilder customer={customer} order={order} payment={payment} />
);
