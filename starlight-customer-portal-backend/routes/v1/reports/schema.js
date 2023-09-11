import Joi from 'joi';
import { REPORT_FORMATS } from '../../../consts/reports.js';

const id = Joi.number().integer().positive();

export const downloadSchema = Joi.object().keys({
  businessUnitId: id.required(),
  customerId: id.required(),
  fileName: Joi.string().required(),
  format: Joi.string()
    .valid(...REPORT_FORMATS)
    .required(),
  path: Joi.string().optional(),
  reportName: Joi.string().required(),
  fromDate: Joi.date().max(Joi.ref('toDate')).required(),
  toDate: Joi.date().required(),
});

export const sessionSchema = Joi.object().keys({
  businessUnitId: id.required(),
  customerId: id.required(),
  fromDate: Joi.date().allow(null),
  toDate: Joi.date().allow(null),
  selfService: Joi.boolean().default(false),
});
