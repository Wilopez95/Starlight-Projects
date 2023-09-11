import Joi from 'joi';

import { BUSINESS_UNIT_TYPES, BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { BILLING_TYPES_VALUES } from '../../../consts/billingTypes.js';
import { PAYMENT_GATEWAYS } from '../../../consts/paymentGateway.js';
import { zipSchema } from '../schema.js';

const address = Joi.object()
  .keys({
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().empty('').allow(null).default(null),
    city: Joi.string().required(),
    state: Joi.string().required(),
  })
  .append(zipSchema)
  .required();

export const createBusinessUnitData = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    type: Joi.string()
      .valid(...BUSINESS_UNIT_TYPES)
      .required()
      .default(BUSINESS_UNIT_TYPE.hauling),

    businessLines: Joi.when('type', {
      is: BUSINESS_UNIT_TYPE.hauling,
      then: Joi.array()
        .items(
          Joi.object()
            .keys({
              id: Joi.number().integer().positive().min(1).required(),
              billingCycle: Joi.string()
                .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
                .required(),
              billingType: Joi.string()
                .valid(...BILLING_TYPES_VALUES)
                .required(),
            })
            .required(),
        )
        .required(),
      otherwise: Joi.array()
        .items(
          Joi.object()
            .keys({
              id: Joi.number().integer().positive().min(1).required(),
              billingCycle: Joi.string()
                .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
                .required(),
              billingType: Joi.string()
                .valid(...BILLING_TYPES_VALUES)
                .required(),
            })
            .required(),
        )
        .required()
        .length(1),
    }),
    merchant: Joi.object()
      .keys({
        paymentGateway: Joi.string()
          .valid(...PAYMENT_GATEWAYS)
          .required(),
        mid: Joi.string().allow(null),
        username: Joi.string().when('mid', {
          is: Joi.string().required(),
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        password: Joi.string().when('mid', {
          is: Joi.string().required(),
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        publicAPIKey: Joi.string().allow(null),
        salespointMid: Joi.string().allow(null),
        salespointUsername: Joi.when('salespointMid', {
          is: Joi.string().required(),
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        salespointPassword: Joi.string().when('salespointMid', {
          is: Joi.string().required(),
          then: Joi.required(),
          otherwise: Joi.string().allow(null),
        }),
      })
      .required()
      .allow(null),
    logoUrl: Joi.string().allow(null),
    nameLine1: Joi.string().required(),
    nameLine2: Joi.string().allow(null),
    facility_address: Joi.string().allow(null),
    website: Joi.string().allow(null),
    email: Joi.string().allow(null),
    phone: Joi.string().required(),
    fax: Joi.string().allow(null),
    applySurcharges: Joi.boolean().required(),
    physicalAddress: address,
    mailingAddress: address,
    printNodeApiKey: Joi.string().allow(null),
    requireDestinationOnWeightOut: Joi.boolean(),
    requireOriginOfInboundLoads: Joi.boolean(),
    unitOfMeasure: Joi.string().allow(null),
    timeZoneName: Joi.string().required().allow(null),
    tcFlag: Joi.boolean().optional(),
    tcText: Joi.string().optional().allow(null),
  })
  .required();

export const updateBusinessUnitData = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    merchant: Joi.object()
      .keys({
        id: Joi.number().positive(),
        paymentGateway: Joi.string()
          .valid(...PAYMENT_GATEWAYS)
          .required(),
        mid: Joi.string().allow(null),
        username: Joi.string().when('mid', {
          is: Joi.string().required(),
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        password: Joi.string().when('mid', {
          is: Joi.string().required(),
          then: Joi.string().required().allow(null),
          otherwise: Joi.string().allow(null),
        }),
        publicAPIKey: Joi.string().allow(null),
        salespointMid: Joi.string().allow(null),
        salespointUsername: Joi.when('salespointMid', {
          is: Joi.string().required(),
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        salespointPassword: Joi.when('salespointMid', {
          is: Joi.string().required(),
          then: Joi.string().required().allow(null),
          otherwise: Joi.string().allow(null),
        }),
      })
      .required()
      .allow(null),
    logoUrl: Joi.string().allow(null),
    nameLine1: Joi.string().required(),
    nameLine2: Joi.string().allow(null),
    facility_address: Joi.string().allow(null),
    website: Joi.string().allow(null),
    email: Joi.string().allow(null),
    phone: Joi.string().required(),
    fax: Joi.string().allow(null),
    applySurcharges: Joi.boolean().required(),
    physicalAddress: address,
    mailingAddress: address,
    printNodeApiKey: Joi.string().allow(null),
    requireDestinationOnWeightOut: Joi.boolean(),
    requireOriginOfInboundLoads: Joi.boolean(),
    unitOfMeasure: Joi.string().allow(null),
    timeZoneName: Joi.string().required().allow(null),
    tcFlag: Joi.boolean().optional(),
    tcText: Joi.string().optional().allow(null),
  })
  .required();

export const addBusinessLinesData = Joi.object()
  .keys({
    businessLines: Joi.array()
      .items(
        Joi.object()
          .keys({
            id: Joi.number().integer().positive().min(1).required(),
            billingCycle: Joi.string()
              .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
              .required(),
            billingType: Joi.string()
              .valid(...BILLING_TYPES_VALUES)
              .required(),
          })
          .required(),
      )
      .required(),
  })
  .required();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

const query = Joi.alternatives().try(Joi.string().trim(), Joi.number()).required();

export const recyclingFacilitiesQuery = Joi.object().keys({ query }).required();

export const updateBusinessUnitMailSettings = Joi.object()
  .keys({
    adminEmail: Joi.string().email().required(),
    notificationEmails: Joi.array().items(Joi.string().email()),
    domainId: Joi.number().integer().positive().allow(null).default(null),

    statementsFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    statementsReplyTo: Joi.string().allow(null).default(null).max(64),
    statementsSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    statementsSubject: Joi.string().allow(null).default(null).max(256),
    statementsBody: Joi.string().allow(null).default(null).max(256),
    statementsDisclaimerText: Joi.string().allow(null).default(null),

    invoicesFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    invoicesReplyTo: Joi.string().allow(null).default(null).max(64),
    invoicesSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    invoicesSubject: Joi.string().allow(null).default(null).max(256),
    invoicesBody: Joi.string().allow(null).default(null).max(256),
    invoicesDisclaimerText: Joi.string().allow(null).default(null),

    receiptsFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    receiptsReplyTo: Joi.string().allow(null).default(null).max(64),
    receiptsSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    receiptsSubject: Joi.string().allow(null).default(null).max(256),
    receiptsBody: Joi.string().allow(null).default(null).max(256),
    receiptsDisclaimerText: Joi.string().allow(null).default(null),

    servicesFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    servicesReplyTo: Joi.string().allow(null).default(null).max(64),
    servicesSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    servicesSubject: Joi.string().allow(null).default(null).max(256),
    servicesBody: Joi.string().allow(null).default(null).max(256),
  })
  .required();

export const confirmed = Joi.object()
  .keys({
    confirmed: Joi.boolean().optional(),
  })
  .required();

export const serviceDaysData = Joi.object()
  .keys({
    serviceDays: Joi.array()
      .items(
        Joi.object().keys({
          id: Joi.number().integer().positive().min(1),
          dayOfWeek: Joi.number().integer().min(0).max(6).required(),
          startTime: Joi.string().allow(null).required(),
          endTime: Joi.string().allow(null).required(),
          active: Joi.boolean().required(),
        }),
      )
      .required(),
  })
  .required();
