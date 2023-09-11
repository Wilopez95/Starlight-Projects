import nock from 'nock';

import { PAYMENT_TERM } from '../../../../consts/paymentTerms.js';
import { BILLING_CYCLE } from '../../../../consts/billingCycles.js';
import { INVOICE_CONSTRUCTION } from '../../../../consts/invoiceConstructions.js';
import { PAYMENT_METHOD } from '../../../../consts/paymentMethods.js';

import { BASE_URL } from './config.js';

const URI = '/payments/check-prepaid-orders';

const defaultInput = [
  {
    attachTicketPref: false,
    attachMediaPref: false,
    customer: {
      id: 1,

      businessName: 'Business',
      firstName: 'Name',
      lastName: 'Surname',

      invoiceConstruction: INVOICE_CONSTRUCTION.byCustomer,
      onAccount: true,
      balance: 100,
      creditLimit: 100,
      billingCycle: BILLING_CYCLE.monthly,
      paymentTerms: PAYMENT_TERM.net30Days,
      addFinanceCharges: false,
      aprType: null,
      financeCharge: null,

      mailingAddressLine1: 'Line 1',
      mailingAddressLine2: 'Line 2',
      mailingCity: 'City',
      mailingState: 'Kansas',
      mailingZip: 'fdsas',

      billingAddressLine1: 'Line 1',
      billingAddressLine2: 'Line 2',
      billingCity: 'City',
      billingState: 'Kansas',
      billingZip: 'fdsas',

      ccProfileId: 1,

      sendInvoicesByEmail: false,
      sendInvoicesByPost: false,
      attachTicketPref: false,
      attachMediaPref: false,
      invoiceEmails: ['e2e@starlight.com'],
      statementEmails: null,
      notificationEmails: null,
      brokerEmail: 'e2e@starlight.com',
      isAutopayExist: false,
      autopayType: null,
    },

    total: 100,

    orders: [
      {
        id: 1,
        jobSite: {
          id: 1,
          addressLine1: 'Line 1',
          addressLine2: 'Line 2',
          state: 'Kansas',
          city: 'City',
          zip: 'fdsas',
        },

        serviceDate: '2021-08-17',
        woNumber: 1,
        ticket: 'dfsf32',
        beforeTaxesTotal: 200,
        surchargesTotal: 0,
        grandTotal: 250,
        paymentMethod: PAYMENT_METHOD.mixed,
        customerJobSite: {
          id: 1,
          customerId: 1,
          jobSiteId: 1,
          sendInvoicesToJobSite: false,
          invoiceEmails: ['e2e@starlight.com'],
        },
        services: [
          {
            isService: true,
            description: 'some service',
            quantity: 10,
            price: 5,
            total: 50,

            billableServiceHistoricalId: 1,
          },
          {
            isService: false,
            description: 'some charge',
            quantity: 10,
            price: 5,
            total: 50,

            billableLineItemHistoricalId: 1,
          },
        ],

        ticketFile: {
          url: 'https://starlight-dev1-files.s3.amazonaws.com/tickets/stark/1.pdf',
          fileName: '1.pdf',
        },

        mediaFiles: [
          {
            id: 1,
            url: 'https://starlight-dev1-files.s3.amazonaws.com/media/stark/1.png',
            fileName: '1.png',
          },
        ],
      },
    ],
  },
];
const defaultOutput = { generationJobId: 1 };
const defaultStatus = 202;

export const billingGenerateInvoices = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status, output);

export default billingGenerateInvoices;
