import nock from 'nock';

import { BASE_URL } from './config.js';

const URI = '/invoices/by-orders';

const defaultInput = { orderIds: [1, 2] };
const defaultOutput = [
  {
    invoiceId: 1,
    orderId: 1,
    pdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/invoices/stark/1.pdf',
  },
  {
    invoiceId: 3,
    orderId: 2,
    pdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/invoices/stark/3.pdf',
  },
];
const defaultStatus = 200;

export const billingGetInvoicesByOrders = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status, output);

export default billingGetInvoicesByOrders;
