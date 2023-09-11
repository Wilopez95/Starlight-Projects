import BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { startOfDay } from 'date-fns';

import { CUSTOMER_SORTING_ATTRIBUTES } from '../../../consts/customerSortingAttributes.js';
import { PHONE_TYPES } from '../../../consts/phoneTypes.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { APR_TYPE, APR_TYPES } from '../../../consts/aprTypes.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { CUSTOMER_GROUP_TYPES } from '../../../consts/customerGroups.js';
import { AUTO_PAY_TYPES } from '../../../consts/customerAutoPayTypes.js';
import { CUSTOMER_STATUSES } from '../../../consts/customerStatuses.js';
import { ORDER_REQUEST_SORTING_ATTRIBUTES } from '../../../consts/orderRequestSortingAttributes.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().utc();

const id = Joi.number().integer().positive();
const emails = Joi.array().items(Joi.string().email());
const purchaseOrder = Joi.object().keys({
  active: Joi.boolean().default(true),
  businessLineIds: Joi.array().items(Joi.number()).required(),
  isOneTime: Joi.boolean().required(),
  poNumber: Joi.string().required(),
  isDefaultByCustomer: Joi.boolean().default(false),
  effectiveDate: date.allow(null),
  expirationDate: date.min(startOfDay(new Date())).allow(null),
  poAmount: Joi.number().allow(null),
});

const invoiceConstructionFilter = Joi.string().valid(...INVOICE_CONSTRUCTIONS);
const paymentTermsFilter = Joi.string().valid(...PAYMENT_TERMS);
const customerTypesFilter = Joi.string().valid(...CUSTOMER_GROUP_TYPES);
const customerStatusesFilter = Joi.string().valid(...CUSTOMER_STATUSES);
const orderRequestSortBy = Joi.string().valid(...ORDER_REQUEST_SORTING_ATTRIBUTES);

const filters = {
  filterByBrokers: Joi.array().single().items(id.required()).max(5),
  filterByZipCodes: Joi.array()
    .single()
    // TODO: This is a temporary hack because we cast all numeric strings to numbers.
    .items(Joi.alternatives(Joi.string().min(5), Joi.number()))
    .max(5),
  filterByInvoiceConstruction: Joi.array().single().items(invoiceConstructionFilter.required()),
  filterByPaymentTerms: Joi.array().single().items(paymentTermsFilter.required()),
  filterByType: Joi.array().single().items(customerTypesFilter.required()),
  filterByBalanceFrom: Joi.number(),
  filterByBalanceTo: Joi.number().greater(Joi.ref('filterByBalanceFrom')),
  filterByGroup: Joi.array().single().items(id.required()).max(5),
  filterByState: Joi.array().single().items(customerStatusesFilter.required()),
  filterBySelfServiceOrderAllowed: Joi.boolean().optional().allow(null),
  filterByOnAccount: Joi.boolean().optional().allow(null),
  filterByHaulerSrn: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
};

const recyclingFeatures = {
  workOrderRequired: Joi.boolean().required(),
  jobSiteRequired: Joi.boolean().required(),
  canTareWeightRequired: Joi.boolean().required(),
  gradingRequired: Joi.boolean().required(),
  gradingNotification: Joi.boolean().required(),
  selfServiceOrderAllowed: Joi.boolean().required(),
};

const searchQuery = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim().allow(null),
  Joi.number(),
);

export const customerData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    commercial: Joi.boolean().required(), // tech field

    email: Joi.string().email(),
    customerGroupId: id.required(),

    signatureRequired: Joi.boolean().required(),
    poRequired: Joi.boolean().required(),
    purchaseOrders: Joi.when('poRequired', {
      is: true,
      then: Joi.array().items(purchaseOrder.required()).required(),
      otherwise: Joi.array().items(purchaseOrder.required()).allow(null),
    }),
    alternateId: Joi.string(),

    firstName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }),
    lastName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }),
    businessName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),

    ownerId: id,
    salesId: Joi.string(),

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
            textOnly: Joi.boolean().default(true),
          })
          .required(),
      )
      .min(1)
      .max(5)
      .required(),

    mainFirstName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    mainLastName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    mainJobTitle: Joi.when('commercial', {
      is: true,
      then: Joi.string().allow(null),
    }),
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

    sendInvoicesByEmail: Joi.boolean(),
    sendInvoicesByPost: Joi.boolean(),
    attachTicketPref: Joi.when('sendInvoicesByEmail', {
      is: true,
      then: Joi.boolean().required(),
    }),
    attachMediaPref: Joi.when('sendInvoicesByEmail', {
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
    creditLimit: Joi.when('onAccount', {
      is: true,
      then: Joi.number().required(),
    }),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .allow(null),
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
      is: APR_TYPE.custom,
      then: Joi.number().required(),
    }),

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
    linkedCustomerIds: Joi.array().items(id),
    haulerSrn: Joi.string().allow(null),
    termsAndConditions: Joi.object().keys({
      tcEmail: Joi.string().optional(),
      tcPhone: Joi.string().optional(),
    }),

    ...recyclingFeatures,
  })
  .required();

export const customerParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...CUSTOMER_SORTING_ATTRIBUTES)
    .optional(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
  customerGroupId: id.optional(),
  businessUnitId: id,
  query: searchQuery,
  walkup: Joi.boolean().optional(),
  ...filters,
});

export const countParams = Joi.object().keys({
  businessUnitId: id,
  query: searchQuery,
  ...filters,
});

export const termsAndConditionsParams = Joi.object().keys({
  customerId: id,
});

export const searchParams = Joi.object()
  .keys({
    businessUnitId: id,
    name: Joi.alternatives().try(Joi.string().trim().min(3).required(), Joi.number()).required(),
    sortBy: Joi.array().single().items(orderRequestSortBy.required()),
    status: Joi.string().valid(...CUSTOMER_STATUSES),
  })
  .required();

export const editCustomerData = Joi.object()
  .keys({
    commercial: Joi.boolean().required(), // tech field
    businessUnitId: id.required(),
    contactId: id.required(), // tech field

    email: Joi.string().email().allow(null),
    customerGroupId: id.required(),

    signatureRequired: Joi.boolean().required(),
    poRequired: Joi.boolean().required(),
    attachMediaPref: Joi.boolean().required(),
    attachTicketPref: Joi.boolean().required(),
    defaultPurchaseOrders: Joi.when('poRequired', {
      is: true,
      then: Joi.array().items(id.required()).required(),
      otherwise: Joi.array().items(id.required()).default([]).allow(null),
    }),
    alternateId: Joi.string().allow(null),
    workOrderNote: Joi.string().allow(null),
    firstName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }).when('commercial', {
      is: true,
      then: Joi.allow(null).default(null),
    }),
    lastName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }).when('commercial', {
      is: true,
      then: Joi.allow(null).default(null),
    }),
    businessName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),

    ownerId: id.allow(null),
    salesId: Joi.string().allow(null),

    phoneNumbers: Joi.array()
      .items(
        Joi.object()
          .keys({
            id,
            type: Joi.string()
              .valid(...PHONE_TYPES)
              .required(),
            // TODO: complement with advanced validation
            number: Joi.string().required(),
            extension: Joi.string().allow(null).default(null),
            textOnly: Joi.boolean().required(),
          })
          .required(),
      )
      .min(1)
      .max(5)
      .required(),

    mainFirstName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    mainLastName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    mainJobTitle: Joi.when('commercial', {
      is: true,
      then: Joi.string().allow(null),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    mainEmail: Joi.when('commercial', {
      is: true,
      then: Joi.string().email().allow(null),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    mainPhoneNumbers: Joi.when('commercial', {
      is: true,
      then: Joi.array()
        .items(
          Joi.object()
            .keys({
              id,
              type: Joi.string()
                .valid(...PHONE_TYPES)
                .required(),
              // TODO: complement with advanced validation
              number: Joi.string().required(),
              extension: Joi.string().allow(null).default(null),
              textOnly: Joi.boolean().required(),
            })
            .required(),
        )
        .min(1)
        .max(5)
        .required(),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),

    invoiceConstruction: Joi.string()
      .valid(...INVOICE_CONSTRUCTIONS)
      .required(),
    sendInvoicesByEmail: Joi.boolean(),
    sendInvoicesByPost: Joi.boolean(),

    onAccount: Joi.boolean().required(),
    creditLimit: Joi.when('onAccount', {
      is: true,
      then: Joi.number().required(),
    }).when('onAccount', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .allow(null)
      .default(null),
    paymentTerms: Joi.when('onAccount', {
      is: true,
      then: Joi.string()
        .valid(...PAYMENT_TERMS)
        .required(),
    }).when('onAccount', {
      is: false,
      then: Joi.allow(null).default(null),
    }),

    addFinanceCharges: Joi.boolean().required(),
    aprType: Joi.when('addFinanceCharges', {
      is: true,
      then: Joi.string()
        .valid(...APR_TYPES)
        .required(),
    }).when('addFinanceCharges', {
      is: false,
      then: Joi.allow(null).default(null),
    }),
    financeCharge: Joi.when('aprType', {
      is: APR_TYPE.custom,
      then: Joi.number().required(),
    }).when('addFinanceCharges', {
      is: !APR_TYPE.custom,
      then: Joi.allow(null).default(null),
    }),

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

    generalNote: Joi.string().max(256).allow(null),
    popupNote: Joi.string().max(256).allow(null),
    billingNote: Joi.string().max(256).allow(null),

    isAutopayExist: Joi.boolean(),
    autopayType: Joi.when('isAutopayExist', {
      is: true,
      then: Joi.string()
        .valid(...AUTO_PAY_TYPES)
        .required(),
    }),
    autopayCreditCardId: Joi.when('isAutopayExist', {
      is: true,
      then: id.required(),
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
    linkedCustomerIds: Joi.array().items(id), // If property will not provided, existing linked customers will be ignored
    haulerSrn: Joi.string().allow(null),
    termsAndConditions: Joi.object().keys({
      tcEmail: Joi.string().optional().allow(null),
      tcPhone: Joi.string().optional().allow(null),
    }),
    ...recyclingFeatures,
  })
  .required();

export const searchCustomersDuplicateData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessName: Joi.string(),
    email: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    phoneNumbers: Joi.array(),
    mainEmail: Joi.string(),
    mainFirstName: Joi.string(),
    mainLastName: Joi.string(),
    mainPhoneNumbers: Joi.array(),
  })
  .required();

export const groupsData = Joi.object()
  .keys({
    ids: Joi.array().items(id).min(1).required(),
  })
  .required();

export const changeStatusData = Joi.object()
  .keys({
    status: Joi.string()
      .valid(...CUSTOMER_STATUSES)
      .required(),
    shouldUnholdTemplates: Joi.boolean().optional(),
    reason: Joi.string().optional(),
    reasonDescription: Joi.string().optional().allow(null),
    holdSubscriptionUntil: Joi.date().optional().allow(null),
    onHoldNotifySalesRep: Joi.boolean().optional().default(false),
    onHoldNotifyMainContact: Joi.boolean().optional().default(false),
  })
  .required();

export const bulkOnHoldData = Joi.object()
  .keys({
    ids: Joi.array().items(id.required()).required(),
    reason: Joi.string().optional(),
    reasonDescription: Joi.string().optional().allow(null),
    holdSubscriptionUntil: Joi.date().optional().allow(null),
    onHoldNotifySalesRep: Joi.boolean().optional().default(true),
    onHoldNotifyMainContact: Joi.boolean().optional().default(true),
  })
  .required();

export const bulkResumeData = Joi.object()
  .keys({
    ids: Joi.array().items(id.required()).required(),
    shouldUnholdTemplates: Joi.boolean().optional(),
  })
  .required();
