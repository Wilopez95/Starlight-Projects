import nock from 'nock';

import { PAYMENT_TYPE } from '../../../../consts/paymentType.js';

import { BASE_URL } from './config.js';

const defaultInput = 1;

const defaultOutput = [
  {
    id: 1,

    originalPaymentId: 1,

    status: 'authorized',
    invoicedStatus: 'applied',
    date: '2022-08-03',
    paymentType: PAYMENT_TYPE.creditCard,
    amount: 250,
    sendReceipt: false,
    checkNumber: null,
    isAch: false,
    memoNote: null,
    billableItemType: null,
    billableItemId: null,
    writeOffNote: null,
    deferredUntil: null,

    prevBalance: 300,
    newBalance: 50,
    appliedAmount: 250,
    unappliedAmount: 0,
    paidOutAmount: 250,
    refundedAmount: 0,
    refundedOnAccountAmount: 0,

    receiptPreviewUrl: 'https://starlight-dev1-files.s3.amazonaws.com/receipts/stark/1.png',
    receiptPdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/receipts/stark/1.pdf',

    isEditable: Boolean,
    orders: [
      {
        id: 1,
        serviceDate: '2022-10-03',

        beforeTaxesTotal: 200,
        grandTotal: 250,
        capturedTotal: 250,
        refundedTotal: 0,

        jobSite: {
          id: 1,
          addressLine1: 'Line 1',
          addressLine2: 'Line 2',
          state: 'Kansas',
          city: 'City',
          zip: 'fdsas',
        },

        assignedAmount: 100,
        receiptPreviewUrl: 'https://starlight-dev1-files.s3.amazonaws.com/receipts/stark/1.png',
        receiptPdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/receipts/stark/1.pdf',
      },
    ],
  },
];
const defaultStatus = 200;

export const billingGetOrdersByPaymentId = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).get(`/payments/${input}/orders`).reply(status, output);

export default billingGetOrdersByPaymentId;
