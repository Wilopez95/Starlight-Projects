import nock from 'nock';

import { PAYMENT_GATEWAY } from '../../../../consts/paymentGateway.js';
import { INVOICE_CONSTRUCTION } from '../../../../consts/invoiceConstructions.js';
import { BILLING_CYCLE } from '../../../../consts/billingCycles.js';
import { PAYMENT_TERM } from '../../../../consts/paymentTerms.js';
import { PAYMENT_METHOD } from '../../../../consts/paymentMethods.js';
import { BUSINESS_UNIT_TYPE } from '../../../../consts/businessUnitTypes.js';

import { BASE_URL } from './config.js';

const defaultInput = {
  active: true,
  cardNickname: 'Nick Name',
  addressLine1: 'Line 1',
  addressLine2: 'Line 2',
  state: 'Kansas',
  city: 'City',
  zip: 'fdsas',
  nameOnCard: 'Name Card',
  expirationDate: '20230711',
  cardNumber: '0321032103210321',
  cvv: '021',
};
const defaultOutput = {
  id: 1,
  active: true,

  cardNickname: 'Nick Name',
  cardType: 'cardConnect',
  cardNumberLastDigits: '0321',

  ccAccountId: 1,
  ccAccountToken: '21312dsad12dasd12szss',

  paymentGateway: PAYMENT_GATEWAY.cardConnect,
  merchantId: 1,

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
  payments: [
    {
      paymentMethod: PAYMENT_METHOD.mixed,
      overrideCreditLimit: false,
      checkNumber: null,
      isAch: false,
      sendReceipt: false,
      deferredPayment: false,
      authorizeCard: false,
      deferredUntil: null,
      amount: 300,
      creditCardId: 1,
      newCreditCard: null,
    },
  ],
  businessUnit: {
    id: 1,

    active: true,
    timeZoneName: 'UTC',
    nameLine1: 'TEST',
    type: BUSINESS_UNIT_TYPE.hauling,

    createdAt: '2021-07-17 20:11:10',
  },
};
const defaultStatus = 200;

export const billingAddCustomerCc = (
  {
    input: { customerId, data } = defaultInput,
    output = defaultOutput,
    status = defaultStatus,
  } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(`/customers/${customerId}/credit-cards`, data).reply(status, output);

export default billingAddCustomerCc;
