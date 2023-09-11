import nock from 'nock';

import { BASE_URL } from './config.js';

const defaultInput = 1;

const defaultOutput = {
  id: 1,
  dueDate: '2021-08-17',
  createdAt: '2021-08-17 19:14:48.000000',

  csrName: 'user1 customer portal',
  csrEmail: 'user1@haulingtest.xyz',
  fine: true,

  total: 188,
  balance: 188,
  pdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/invoices/stark/1.pdf',
  previewUrl: null,

  type: 'orders',

  customer: {
    id: 1,

    businessUnitId: 1,
    businessName: 'Prepaid',
    firstName: 'Prepaid',
    lastName: 'Monthly',
    name: 'Prepaid Monthly',
  },
  writeOff: false,
};
const defaultStatus = 200;

export const billingGetInvoiceById = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).get(`/invoices/${input}?openOnly=false`).reply(status, output);

export default billingGetInvoiceById;
