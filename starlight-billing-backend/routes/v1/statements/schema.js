import Joi from 'joi';

const id = Joi.number().integer().positive();

export const statementDownloadSchema = Joi.object().keys({
  id: Joi.array().single().items(id.required()),
});

export const statementViewSchema = Joi.object().keys({
  id: id.required(),
});

export const financeChargeDraftSchema = Joi.object().keys({
  id: Joi.array().single().items(id.required()).required(),
});
