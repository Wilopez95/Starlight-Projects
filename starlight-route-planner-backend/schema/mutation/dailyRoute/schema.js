import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { JOI_DATE_FORMAT, JOI_LT_FORMAT } from '../../../consts/formats.js';
import { DAILY_ROUTE_STATUSES } from '../../../consts/dailyRoute.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().format(JOI_DATE_FORMAT).utc();
const localTime = Joi.date().format(JOI_LT_FORMAT).utc();
const id = Joi.number().integer().positive();

export const createDailyRouteSchema = Joi.object().keys({
  name: Joi.string().max(30).required(),
  serviceDate: date.required(),
  color: Joi.string().required(),
  workOrderIds: Joi.array().items(Joi.number().required()),
  truckId: Joi.string().required(),
  driverId: id.required(),
});

export const updateDailyRouteSchema = Joi.object().keys({
  id: id.required(),
  workOrderIds: Joi.array().items(Joi.number().required()),
  name: Joi.required(),
  truckId: Joi.string().required(),
  driverId: id.required(),
});

export const updateDailyRouteQuickViewSchema = Joi.object()
  .keys({
    name: Joi.string().optional(),
    driverId: Joi.number().allow(null).optional(),
    status: Joi.string()
      .valid(...DAILY_ROUTE_STATUSES)
      .optional(),
    clockIn: localTime.allow(null).optional(),
    clockOut: localTime.allow(null).optional(),
    truckId: Joi.string().allow(null).optional(),
    odometerStart: Joi.number().allow(null).optional(),
    odometerEnd: Joi.number().allow(null).optional(),
  })
  .required();
