import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { JOI_DATE_FORMAT } from '../../../consts/formats.js';
import { BUSINESS_LINE_ROUTE_TYPES } from '../../../consts/businessLineTypes.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().format(JOI_DATE_FORMAT);
const id = Joi.number().integer().positive();

const dailyRouteFilters = Joi.object().keys({
  serviceDate: date.required(),
  serviceAreaIds: Joi.array().items(id.required()),
  businessLineTypes: Joi.array().items(
    Joi.string()
      .valid(...BUSINESS_LINE_ROUTE_TYPES)
      .required(),
  ),
  skip: id.allow(0),
  limit: id,
});

export const getDailyRoutesSchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    input: dailyRouteFilters,
  })
  .required();

const dailyRouteDashboardFilters = Joi.object().keys({
  serviceAreaIds: Joi.array().items(id.required()),
  serviceDate: date.required(),
  businessLineTypes: Joi.array().items(
    Joi.string()
      .valid(...BUSINESS_LINE_ROUTE_TYPES)
      .required(),
  ),
  statuses: Joi.array().items(Joi.string().required()),
  truckTypes: Joi.array().items(Joi.string().required()),
});

export const getDailyRoutesDashboardSchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    searchInput: Joi.string().allow('').optional(),
    input: dailyRouteDashboardFilters,
  })
  .required();
