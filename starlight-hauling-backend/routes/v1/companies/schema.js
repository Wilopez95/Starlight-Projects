import Joi from 'joi';
import { FINANCE_CHARGE_METHODS } from '../../../consts/financeChargeMethod.js';
import { MEASUREMENT_UNITS } from '../../../consts/units.js';
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

export const companyLogoData = Joi.object()
  .keys({
    companyNameLine1: Joi.string().required(),
    companyNameLine2: Joi.string().allow(null),
    logoUrl: Joi.string().allow(null),
  })
  .required();

export const companyInformationData = Joi.object()
  .keys({
    phone: Joi.string().required(),
    officialWebsite: Joi.string().allow(null),
    officialEmail: Joi.string().email().allow(null),
    physicalAddress: address,
    mailingAddress: address,
    fax: Joi.string().allow(null),
  })
  .required();

export const companyMailSettingsData = Joi.object()
  .keys({
    adminEmail: Joi.string().email().required(),
    notificationEmails: Joi.array().items(Joi.string().email()),
    domainId: Joi.number().integer().positive().allow(null).default(null),

    statementsFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    statementsReplyTo: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    statementsSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    statementsSubject: Joi.string().allow(null).default(null).max(256),
    statementsBody: Joi.string().allow(null).default(null).max(1000),
    statementsDisclaimerText: Joi.string().allow(null).default(null),

    invoicesFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    invoicesReplyTo: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    invoicesSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    invoicesSubject: Joi.string().allow(null).default(null).max(256),
    invoicesBody: Joi.string().allow(null).default(null).max(1000),
    invoicesDisclaimerText: Joi.string().allow(null).default(null),

    receiptsFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    receiptsReplyTo: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    receiptsSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    receiptsSubject: Joi.string().allow(null).default(null).max(256),
    receiptsBody: Joi.string().allow(null).default(null).max(1000),
    receiptsDisclaimerText: Joi.string().allow(null).default(null),

    servicesFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    servicesReplyTo: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    servicesSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    servicesSubject: Joi.string().allow(null).default(null).max(256),
    servicesBody: Joi.string().allow(null).default(null).max(1000),

    subscriptionsEndFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    subscriptionsEndSubject: Joi.string().allow(null).default(null).max(256),
    subscriptionsEndBody: Joi.string().allow(null).default(null).max(1000),

    subscriptionsResumeFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    subscriptionsResumeSubject: Joi.string().allow(null).default(null).max(256),
    subscriptionsResumeBody: Joi.string().allow(null).default(null).max(1000),

    customerOnHoldFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    customerOnHoldSubject: Joi.string().allow(null).default(null).max(256),
    customerOnHoldBody: Joi.string().allow(null).default(null).max(1000),

    weightTicketFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    weightTicketReplyTo: Joi.string().allow(null).default(null).max(64),
    weightTicketSendCopyTo: Joi.string().email().allow(null).default(null).max(64),
    weightTicketSubject: Joi.string().allow(null).default(null).max(256),
    weightTicketBody: Joi.string().allow(null).default(null).max(1000),
    weightTicketDisclaimerText: Joi.string().allow(null).default(null),
    termsAndConditionsFrom: Joi.alternatives().try(
      Joi.string().hostname().allow(null).default(null).max(64),
      Joi.string().email().allow(null).default(null).max(64),
    ),
    termsAndConditionsReplyTo: Joi.string().allow(null).default(null).max(64),
    termsAndConditionsSubject: Joi.string().allow(null).default(null).max(256),
    termsAndConditionsBody: Joi.string().allow(null).default(null).max(1000),
  })
  .required();

export const financeChargeSettingsData = Joi.object()
  .keys({
    financeChargeApr: Joi.number().required().positive().allow(0),
    financeChargeMethod: Joi.string()
      .valid(...FINANCE_CHARGE_METHODS)
      .required(),
    financeChargeMinValue: Joi.number().required().positive().allow(0),
    financeChargeMinBalance: Joi.number().required().positive().allow(0),
  })
  .required();

export const domainData = Joi.object().keys({
  name: Joi.string().required().hostname().max(256),
});

export const companyGeneralSettingsData = Joi.object()
  .keys({
    timeZoneName: Joi.string().required(),
    unit: Joi.string()
      .valid(...MEASUREMENT_UNITS)
      .required(),
    clockIn: Joi.boolean().required(),
  })
  .required();
