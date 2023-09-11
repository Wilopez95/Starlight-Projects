import Joi from 'joi';

import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../../consts/billingCycles.js';
import { PAYMENT_TERMS } from '../../../../consts/paymentTerms.js';
import { INVOICE_CONSTRUCTIONS } from '../../../../consts/invoiceConstructions.js';

const id = Joi.number().integer().positive();
const emails = Joi.array().items(Joi.string().email());
export const customersImportParams = Joi.object()
  .keys({
    businessUnitId: id,
    customerGroupId: id,
  })
  .required();

export const customerData = Joi.object()
  .keys({
    referenceNumber: Joi.required(),
    commercial: Joi.boolean().required(),
    businessName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),

    email: Joi.string().email(),
    phoneNumber: Joi.number().required(),
    phoneNumberExt: Joi.number().optional().allow(null),

    mailingAddressLine1: Joi.string().required(),
    mailingAddressLine2: Joi.string().empty('').allow(null).default(null),
    mailingCity: Joi.string().required(),
    mailingState: Joi.string().required(),
    mailingZip: Joi.number().min(5).required(),

    billingSameAsMailing: Joi.boolean().required(),

    billingAddressLine1: Joi.when('billingSameAsMailing', {
      is: false,
      then: Joi.string().required(),
    }),
    billingAddressLine2: Joi.when('billingSameAsMailing', {
      is: false,
      then: Joi.string().empty('').allow(null).default(null),
    }),
    billingCity: Joi.when('billingSameAsMailing', { is: false, then: Joi.string().required() }),
    billingState: Joi.when('billingSameAsMailing', { is: false, then: Joi.string().required() }),
    billingZip: Joi.when('billingSameAsMailing', {
      is: false,
      then: Joi.number().min(5).required(),
    }),

    firstName: Joi.when('commercial', { is: false, then: Joi.string().required() }),
    lastName: Joi.when('commercial', { is: false, then: Joi.string().required() }),

    contactFirstName: Joi.when('commercial', { is: true, then: Joi.string().required() }),
    contactLastName: Joi.when('commercial', { is: true, then: Joi.string().required() }),
    contactEmail: Joi.when('commercial', { is: true, then: Joi.string().email() }),
    contactPhone: Joi.when('commercial', { is: true, then: Joi.number() }),
    contactPhoneExt: Joi.number().optional().allow(null),

    onAccount: Joi.boolean().required(),

    paymentTerms: Joi.when('onAccount', {
      is: true,
      then: Joi.string()
        .valid(...PAYMENT_TERMS)
        .required(),
    }),

    invoiceByType: Joi.string()
      .valid(...INVOICE_CONSTRUCTIONS)
      .required(),

    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .allow(null),

    sendInvoicesByEmail: Joi.boolean().required(),
    invoiceEmails: Joi.when('sendInvoicesByEmail', {
      is: true,
      then: emails.required().min(1),
    }),

    generalNote: Joi.string().max(256),
    popupNote: Joi.string().max(256),

    customerGroupId: id.required(),
    businessUnitId: id.required(),
  })
  .required();
