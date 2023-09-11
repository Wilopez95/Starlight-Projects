import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { PHONE_TYPES } from '../../../consts/phoneTypes.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { APR_TYPES } from '../../../consts/aprTypes.js';

const Joi = BaseJoi.extend(JoiDate);

const id = Joi.number().integer().positive();
const emails = Joi.array().items(Joi.string().email());

const recyclingFeatures = {
  workOrderRequired: Joi.boolean().default(false),
  jobSiteRequired: Joi.boolean().default(false),
  canTareWeightRequired: Joi.boolean().default(false),
  gradingRequired: Joi.boolean().default(false),
  gradingNotification: Joi.boolean().default(false),
  selfServiceOrderAllowed: Joi.boolean().default(false),
};

export const customerData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    // commercial: Joi.boolean().required(), // calc later

    email: Joi.string().email(),
    customerGroupId: id.required(),

    signatureRequired: Joi.boolean().required(), // false
    poRequired: Joi.boolean().required(), // false
    // purchaseOrders: Joi.when('poRequired', {
    //     is: true,
    //     then: Joi.array().items(purchaseOrder.required()).required(),
    //     otherwise: Joi.array().items(purchaseOrder.required()).allow(null),
    // }),
    // alternateId: Joi.string(),

    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    // To copy just in case
    businessName: Joi.string().required(),

    // skip
    // ownerId: id,
    // salesId: Joi.string(),

    phoneNumbers: Joi.array()
      .items(
        Joi.object()
          .keys({
            type: Joi.string()
              .valid(...PHONE_TYPES)
              .required(),
            // TODO: complement with advanced validation
            number: Joi.string().required(),
            extension: Joi.string().allow(null).default(null),
            textOnly: Joi.boolean().default(true), // TRUE
          })
          .required(),
      )
      .min(1)
      .max(5)
      .required(),

    // To duplicate
    mainFirstName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    mainLastName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    // mainJobTitle: Joi.when('commercial', {
    //     is: true,
    //     then: Joi.string().allow(null),
    // }),
    mainEmail: Joi.when('commercial', {
      is: true,
      then: Joi.string().email(),
    }),
    mainPhoneNumbers: Joi.when('commercial', {
      is: true,
      then: Joi.array()
        .items(
          Joi.object()
            .keys({
              type: Joi.string()
                .valid(...PHONE_TYPES)
                .required(),
              // TODO: complement with advanced validation
              number: Joi.string().required(),
              extension: Joi.string().allow(null).default(null),
              textOnly: Joi.boolean().default(true),
            })
            .required(),
        )
        .min(1)
        .max(5)
        .required(),
    }),

    sendInvoicesByEmail: Joi.boolean(), // true
    sendInvoicesByPost: Joi.boolean(), // false
    attachTicketPref: Joi.when('sendInvoicesByEmail', {
      // false
      is: true,
      then: Joi.boolean().required(),
    }),
    attachMediaPref: Joi.when('sendInvoicesByEmail', {
      // false
      is: true,
      then: Joi.boolean().required(),
    }),
    invoiceEmails: Joi.when('sendInvoicesByEmail', {
      is: true,
      then: emails.required().min(1),
      otherwise: emails,
    }),
    statementEmails: Joi.when('sendInvoicesByEmail', {
      is: true,
      then: emails.required().min(1),
      otherwise: emails,
    }),
    notificationEmails: Joi.when('sendInvoicesByEmail', {
      is: true,
      then: emails.required().min(1),
      otherwise: emails,
    }),

    invoiceConstruction: Joi.string()
      .valid(...INVOICE_CONSTRUCTIONS)
      .required(),

    onAccount: Joi.boolean().required(),
    // creditLimit: Joi.when('onAccount', {
    //     is: true,
    //     then: Joi.number().required(),
    // }),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .allow(null),
    // paymentTerms: Joi.when('onAccount', {
    //     is: true,
    //     then: Joi.string()
    //         .valid(...PAYMENT_TERMS)
    //         .required(),
    // }),

    addFinanceCharges: Joi.boolean().required(),
    aprType: Joi.when('addFinanceCharges', {
      is: true,
      then: Joi.string()
        .valid(...APR_TYPES)
        .required(),
    }),
    // financeCharge: Joi.when('aprType', {
    //     is: APR_TYPE.custom,
    //     then: Joi.number().required(),
    // }),

    mailingAddress: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().min(5).required(),
      })
      .required(),

    billingAddress: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().min(5).required(),
      })
      .required(),

    generalNote: Joi.string().max(256),
    popupNote: Joi.string().max(256),
    billingNote: Joi.string().max(256).allow(null),

    ...recyclingFeatures, // all false
  })
  .required();

export const ccData = Joi.object()
  .keys({
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
  })
  .required();

export const jobSiteData = Joi.object()
  .keys({
    address: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
      })
      .required(),

    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),

    location: Joi.object()
      .keys({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      })
      .required(),
  })
  .required();

export const orderRequestData = Joi.object()
  .keys({
    customerId: id.required(),
    jobSiteId: id.required(),
    serviceAreaId: id.required(),

    canDetails: Joi.object()
      .keys({
        materialTypeId: id.required(),
        canTypeId: id.required(),

        scheduledDate: Joi.date().iso().required(),
        placementInstructions: Joi.string().allow(null, '').optional(),

        alleyPlacement: Joi.boolean().optional(),
        someoneOnSite: Joi.boolean().optional(),

        mediaUrls: Joi.array().items(Joi.string()).optional(),
        quantity: Joi.number().required().default(1),
        priceEach: Joi.number().min(0).required(),
      })
      .required(),

    totalPrice: Joi.number().min(0).required(),

    paymentDetails: Joi.object()
      .keys({
        paymentType: Joi.string().required(),
        cardId: id.allow(null, '').optional(),
      })
      .required(),
  })
  .required();
