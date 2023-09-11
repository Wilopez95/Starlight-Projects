import Joi from 'joi';

import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from '../../consts/auditLog.js';

const CORE_ENTIIES = Object.values(AUDIT_LOG_ENTITY);
const BILLING_ENTITIES = [
  'Payout',
  'Payment',
  'CreditMemo',
  'WriteOff',
  'ReversedPayment',
  'Invoice',
  'CreditCard',
  'BatchStatement',
  'Statement',
  'Settlement',
  'BankDeposit',
];
const UMS_ENTITIES = ['User', 'Role'];
const ROUTE_PLANNER_ENTITIES = ['MasterRoute'];

const id = Joi.number().integer().positive();

const query = Joi.alternatives().try(Joi.string().trim(), Joi.number()).required();

export const addressSuggestionsParam = Joi.object().keys({ query }).required();

export const geofenceSuggestionsParams = Joi.object().keys({
  point: Joi.object().keys({ coordinates: Joi.array().items(Joi.number()).length(2) }),
  radius: Joi.number().integer().positive().default(1000),
});

export const suggestionsParam = Joi.object()
  .keys({ query, businessUnitId: id.required() })
  .required();

export const multiSearchParam = Joi.object()
  .keys({ query, businessUnitId: id.required() })
  .required();

export const linkedJobSiteAndCustomer = Joi.object().keys({
  jobSiteId: id,
  customerId: id,
});

export const buSwitchParams = Joi.object().keys({
  businessUnitId: id,
  businessLineId: id,
});

export const businessUnitId = Joi.object()
  .keys({
    businessUnitId: id.required(),
  })
  .required();

export const paginationParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const auditLogsParams = Joi.object().keys({
  entityId: Joi.alternatives(id, Joi.string().required()),
  businessUnitIds: Joi.array().items(id).allow(null),
  userIds: Joi.array().items(Joi.string()).allow(null),

  entities: Joi.array().items(
    ...[...CORE_ENTIIES, ...BILLING_ENTITIES, ...UMS_ENTITIES, ...ROUTE_PLANNER_ENTITIES],
  ),
  actions: Joi.array().items(
    AUDIT_LOG_ACTION.create,
    AUDIT_LOG_ACTION.modify,
    AUDIT_LOG_ACTION.delete,
  ),

  dateFrom: Joi.date().allow(null),
  dateTo: Joi.date().allow(null),
});

const patterns = {
  // http://i18napis.appspot.com/address/data/US
  US: /^(\d{5})(?:[ -](\d{4}))?$/,
  // https://i18napis.appspot.com/address/data/GB
  // eslint-disable-next-line max-len
  GB: /^GIR ?0AA|(?:(?:AB|AL|B|BA|BB|BD|BH|BL|BN|BR|BS|BT|BX|CA|CB|CF|CH|CM|CO|CR|CT|CV|CW|DA|DD|DE|DG|DH|DL|DN|DT|DY|E|EC|EH|EN|EX|FK|FY|G|GL|GY|GU|HA|HD|HG|HP|HR|HS|HU|HX|IG|IM|IP|IV|JE|KA|KT|KW|KY|L|LA|LD|LE|LL|LN|LS|LU|M|ME|MK|ML|N|NE|NG|NN|NP|NR|NW|OL|OX|PA|PE|PH|PL|PO|PR|RG|RH|RM|S|SA|SE|SG|SK|SL|SM|SN|SO|SP|SR|SS|ST|SW|SY|TA|TD|TF|TN|TQ|TR|TS|TW|UB|W|WA|WC|WD|WF|WN|WR|WS|WV|YO|ZE)(?:\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}))|BFPO ?\d{1,4}$/,
  EU: /^[A-Z][A-Z0-9]{1,3} [A-Z0-9]{3}$/,
  // https://i18napis.appspot.com/address/data/CA
  CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/,
};

export const zipSchema = {
  region: Joi.string()
    .required()
    .valid(...Object.keys(patterns)),
  zip: Joi.alternatives().conditional('region', [
    { is: 'US', then: Joi.string().required().regex(patterns.US) },
    { is: 'GB', then: Joi.string().required().regex(patterns.GB) },
    {
      is: 'EU',
      then: Joi.string().required().regex(patterns.EU),
      otherwise: Joi.string().required().regex(patterns.CA),
    },
  ]),
};
