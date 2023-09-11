import nock from 'nock';

import { INVOICE_CONSTRUCTION } from '../../../../consts/invoiceConstructions.js';
import { BILLABLE_ITEMS_BILLING_CYCLE, BILLING_CYCLE } from '../../../../consts/billingCycles.js';
import { PAYMENT_TERM } from '../../../../consts/paymentTerms.js';
import { PAYMENT_METHOD } from '../../../../consts/paymentMethods.js';
import { BILLING_TYPES } from '../../../../consts/billingTypes.js';
import { ONE_TIME_ACTION } from '../../../../consts/actions.js';

import { BASE_URL } from './config.js';

const URI = '/invoices/subscriptions-orders/generate';

const defaultInput = {
  invoices: [
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
      subscriptions: [
        {
          id: 1,
          businessUnitId: 1,
          businessLineId: 1,
          startDate: '2021-06-17',
          endDate: '2021-09-17',

          nextBillingPeriodFrom: '2021-09-17',
          nextBillingPeriodTo: '2021-10-17',

          totalPriceForSubscription: 500,

          billingCycle: BILLABLE_ITEMS_BILLING_CYCLE.monthly,

          billingType: BILLING_TYPES.inAdvance,

          anniversaryBilling: false,

          jobSite: {
            id: 1,
            addressLine1: 'Line 1',
            addressLine2: 'Line 2',
            state: 'Kansas',
            city: 'City',
            zip: 'fdsas',
          },

          mediaFiles: {
            id: 1,
            url: 'https://starlight-dev1-files.s3.amazonaws.com/media/stark/1.png',
            fileName: '1.png',
          },

          summaryPerServiceItem: {
            serviceItemId: 1,
            serviceName: 'some service',

            lineItems: {
              lineItemId: 1,
              totalDay: 30,
              price: 5,
              usageDay: 30,
              serviceName: 'some charge',
              quantity: 1,
              totalPrice: 5,

              since: '2021-08-17',
              from: '2021-09-17',
            },

            serviceItems: [
              {
                totalDay: 30,
                price: 5,
                usageDay: 30,
                quantity: 1,
                totalPrice: 5,

                since: '2021-08-17',
                from: '2021-09-17',

                subscriptionOrders: [
                  {
                    subscriptionOrderId: 1,
                    serviceDate: '2021-08-19',
                    price: 5,
                    serviceName: 'some service',
                    quantity: 1,
                    action: ONE_TIME_ACTION.delivery,
                    grandTotal: 5,

                    subOrderLineItems: [
                      {
                        id: 1,
                        price: 5,
                        serviceName: 'some charge',
                        quantity: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
  generationJobId: 1,
};
const defaultOutput = { generationJobId: 1 };
const defaultStatus = 202;

export const billingGenerateInvoicesSubscriptionsOrders = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status, output);

export default billingGenerateInvoicesSubscriptionsOrders;
