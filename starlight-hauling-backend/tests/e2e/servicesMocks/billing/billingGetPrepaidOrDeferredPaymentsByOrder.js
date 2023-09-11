import nock from 'nock';
import httpStatus from 'http-status';
import { startOfTomorrow } from 'date-fns';

import { PAYMENT_TYPE } from '../../../../consts/paymentType.js';
import { BASE_URL } from './config.js';

const uriPattern = /^\/api\/billing\/v1\/payments\/prepaid\/(\d+)$/;

const getDefaultOutput = uri => {
  const url = new URL(new URL(BASE_URL).origin + uri);
  const deferredOnly = url.searchParams?.get('deferredOnly') === 'true';
  const path = url.pathname.split('/');
  const orderId = path[path.length - 1];
  return [
    {
      id: 1,

      originalPaymentId: 1,

      status: deferredOnly ? 'deferred' : 'authorized',
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
      deferredUntil: deferredOnly ? startOfTomorrow().toISOString().substring(0, 10) : null,

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
          id: orderId,
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
};
const defaultStatus = httpStatus.CREATED;

export const billingGetPrepaidOrDeferredPaymentsByOrder = (
  { status = defaultStatus, outputCallback } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .get(uriPattern)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default billingGetPrepaidOrDeferredPaymentsByOrder;
