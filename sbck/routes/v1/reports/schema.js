import Joi from 'joi';
import { REPORT_FOLDERS, REPORT_FORMATS, WEIGHT_TICKET_TYPES } from '../../../consts/reports.js';

const id = Joi.number().integer().positive();

export const listSchema = Joi.object().keys({
  folder: Joi.string()
    .valid(...REPORT_FOLDERS)
    .required(),
});

export const downloadInvoiceSchema = Joi.object().keys({
  id: id.required(),
  count: id.required(),
});

export const downloadWeightTicketSchema = Joi.object().keys({
  orderId: id.required(),
  businessLineId: id.required(),
  type: Joi.string()
    .valid(...WEIGHT_TICKET_TYPES)
    .required(),
});

export const downloadSchema = Joi.object().keys({
  customerId: id.optional(),
  fileName: Joi.string().required(),
  format: Joi.string()
    .valid(...REPORT_FORMATS)
    .required(),
  path: Joi.string().optional(),
  reportName: Joi.string().required(),
  fromDate: Joi.date().max(Joi.ref('toDate')).required(),
  toDate: Joi.date().required(),
});

export const materialsReportSchema = Joi.object().keys({
  customerId: id.required(),

  jobSiteId: id.optional(),
  allActiveOnly: Joi.boolean().optional(),

  fromDate: Joi.date().max(Joi.ref('toDate')).required(),
  toDate: Joi.date().required(),
});

export const routeSheetReportSchema = Joi.object().keys({
  dailyRouteId: id.required(),
});

export const initSchema = Joi.object().keys({
  customerId: id.optional(),
  fromDate: Joi.date().allow(null),
  toDate: Joi.date().allow(null),
  selfService: Joi.boolean().default(false),
  linesOfBusiness: Joi.string().optional(),
});

export const createSchema = Joi.object().keys({
  fromDate: Joi.date().allow(null),
  toDate: Joi.date().allow(null),
  selfService: Joi.boolean().valid(true).required(),
});

export const deleteSchema = Joi.object().keys({
  selfService: Joi.boolean().valid(true).required(),
});

export const initDuplicateSchema = Joi.object().keys({
  fromDate: Joi.date().allow(null),
  toDate: Joi.date().allow(null),
  selfService: Joi.boolean().valid(true).required(),
  path: Joi.string().required(),
});
