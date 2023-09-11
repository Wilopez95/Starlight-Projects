import Joi from 'joi';

import { APR_TYPES, AprType } from '../../../consts/aprTypes.js';
import { BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';

const emails = Joi.array().items(Joi.string().email());

export const customerDataToSync = Joi.object()
  .keys({
    businessName: Joi.string().allow(null),
    firstName: Joi.string().allow(null),
    lastName: Joi.string().allow(null),

    invoiceConstruction: Joi.string()
      .valid(...INVOICE_CONSTRUCTIONS)
      .required(),
    onAccount: Joi.boolean().required(),
    creditLimit: Joi.when('onAccount', {
      is: true,
      then: Joi.number().required(),
    }),
    billingCycle: Joi.when('onAccount', {
      is: true,
      then: Joi.string().valid(...BILLING_CYCLES),
    }),
    paymentTerms: Joi.when('onAccount', {
      is: true,
      then: Joi.string()
        .valid(...PAYMENT_TERMS)
        .required(),
    }),
    addFinanceCharges: Joi.boolean().required(),
    aprType: Joi.when('addFinanceCharges', {
      is: true,
      then: Joi.string()
        .valid(...APR_TYPES)
        .required(),
    }),
    financeCharge: Joi.when('aprType', {
      is: AprType.CUSTOM,
      then: Joi.number().required(),
    }),

    mailingAddressLine1: Joi.string().required(),
    mailingAddressLine2: Joi.string().allow(null).default(null),
    mailingCity: Joi.string().required(),
    mailingState: Joi.string().required(),
    mailingZip: Joi.string().min(5).required(),

    billingAddressLine1: Joi.string().required(),
    billingAddressLine2: Joi.string().allow(null).default(null),
    billingCity: Joi.string().required(),
    billingState: Joi.string().required(),
    billingZip: Joi.string().min(5).required(),

    ccProfileId: Joi.string().allow(null),

    sendInvoicesByEmail: Joi.boolean().default(false),
    sendInvoicesByPost: Joi.boolean().default(false),
    attachTicketPref: Joi.boolean().default(false),
    attachMediaPref: Joi.boolean().default(false),
    invoiceEmails: emails.allow(null),
    statementEmails: emails.allow(null),
    notificationEmails: emails.allow(null),
  })
  .required();

export const addCcData = Joi.object()
  .keys({
    isContractor: Joi.boolean().default(false),
    active: Joi.boolean().default(true).required(),
    cardNickname: Joi.string().optional(),

    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(null).default(null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().min(5).required(),

    nameOnCard: Joi.string().required(),
    expirationDate: Joi.string().max(4).required(),
    cardNumber: Joi.string().required(),
    cvv: Joi.string().min(3).max(4).required(),

    spUsed: Joi.boolean().default(false),
  })
  .required();

export const filterCc = Joi.object().keys({
  activeOnly: Joi.boolean().optional(),
  spUsedOnly: Joi.boolean().optional(),
  creditCardId: Joi.number().positive().optional(),
  merchantId: Joi.number().positive().optional(),
});
