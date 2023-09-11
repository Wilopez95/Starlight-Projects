import React from 'react';

import SettlementBuilder from './SettlementBuilder';

export default {
  title: 'SettlementBuilder',
};

const transactions = [
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 1.5,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 0.5,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 146.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 215.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 0.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 146.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 159.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 146.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2.5,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 5,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 210.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 5,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 0.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 145.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 0.03,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 0.01,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 2,
    adjustment: 0,
    fee: 0,
  },
  {
    customerName: 'Willms, Gutkowski and Funk',
    amount: 195.01,
    adjustment: 0,
    fee: 0,
  },
];

export const Default: React.FC = () => (
  <SettlementBuilder settlementDate={new Date()} transactions={transactions} />
);
