import Joi from 'joi';

const id = Joi.number().integer().positive();

export const configurationParams = Joi.object().keys({
  id: Joi.number(),
});

export const integrationId = Joi.object().keys({
  integrationId: Joi.number(),
});

export const createConfiguration = Joi.object()
  .keys({
    password: Joi.string().required(),
    lastSuccessfulIntegration: Joi.string().required(),
    dateToAdjustment: Joi.number().positive().required(),
    integrationPeriod: Joi.date().required(),
    integrationBuList: Joi.array().items(id).required(),
    description: Joi.string().required(),
    systemType: Joi.string().required(),
  })
  .required();

export const updateConfiguration = Joi.object()
  .keys({
    password: Joi.string().allow(null).allow(''),
    integrationPeriod: Joi.string(),
    dateToAdjustment: Joi.number().positive(),
    lastSuccessfulIntegration: Joi.string(),
    integrationBuList: Joi.array().items(id).single(),
    accountReceivable: Joi.string().allow(null).allow(''),
    defaultAccountIncome: Joi.string().allow(null).allow(''),
    defaultAccountTax: Joi.string().allow(null).allow(''),
    defaultPaymentAccount: Joi.string().allow(null).allow(''),
    defaultAccountFinCharges: Joi.string().allow(null).allow(''),
    writeoffAccount: Joi.string().allow(null).allow(''),
    creditMemoAccount: Joi.string().allow(null).allow(''),
  })
  .required();

export const accountsSchema = Joi.object()
  .keys({
    'accountReceivable': Joi.string().min(1).required(),
    'defaultAccountIncome': Joi.string().min(1).required(),
    'defaultAccountTax': Joi.string().min(1).required(),
    'defaultPaymentAccount': Joi.string().min(1).required(),
    'defaultAccountFinCharges': Joi.string().min(1).required(),
    'writeoffAccount': Joi.string().min(1).required(),
    'creditMemoAccount': Joi.string().min(1).required(),
  })
  .required();
