import BaseJoi from 'joi';
import JoiDate from '@joi/date';
import dateFns from 'date-fns';

import { JOI_DATE_FORMAT } from '../../../consts/formats.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().format(JOI_DATE_FORMAT);
const id = Joi.number().integer().positive();

const serviceDayDetails = Joi.object().keys({
  route: Joi.string().allow(''),
  requiredByCustomer: Joi.boolean(),
});

const serviceItem = Joi.object().keys({
  id: id.required(),
  serviceDaysOfWeek: Joi.object()
    .pattern(Joi.number().integer().min(0).max(6), serviceDayDetails.required())
    .required(),
  serviceFrequencyId: id.min(1).max(7).allow(108),
  jobSiteId: id.required(),
  businessLineId: id.required(),
  materialId: id.required(),
  subscriptionId: id.required(),
  businessUnitId: id.required(),
  startDate: date.required(),
  customerId: id.required().allow(-1),
  endDate: date.allow(null),
  serviceAreaId: Joi.number().allow(null),
  equipmentItemId: Joi.number().required(),
  bestTimeToComeFrom: Joi.string().allow(null),
  bestTimeToComeTo: Joi.string().allow(null),
  billableServiceId: id.required(),
  billableServiceDescription: Joi.string().required(),
});

export const createMasterRouteSchema = Joi.object().keys({
  name: Joi.string().max(30).required(),
  truckId: Joi.string().allow(null),
  driverId: Joi.number().integer().allow(null),
  businessUnitId: Joi.number().integer().required(),
  color: Joi.string().required(),
  serviceDaysList: Joi.array().items(Joi.number().required()),
  serviceItems: Joi.array().items(serviceItem.required()),
});

export const publishMasterRouteSchema = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
  publishDate: date.min(dateFns.startOfDay(dateFns.addDays(new Date(), 1))).required(),
});

export const updateMasterRouterSchema = Joi.object().keys({
  id: Joi.number().integer().required(),
  name: Joi.string().max(30).allow(null),
  truckId: Joi.string().allow(null),
  driverId: Joi.number().integer().allow(null),
  serviceDaysList: Joi.array().items(Joi.number().required()),
  serviceItems: Joi.array().items(serviceItem.required()),
});

export const updateMasterRouterGridSchemaData = Joi.object().keys({
  id: Joi.number().integer().required(),
  serviceItemMasterRouteId: Joi.number().integer().required(),
  newRoute: Joi.number().integer().optional(),
  newSequence: Joi.number().integer().optional(),
  newServiceDay: Joi.number().integer().optional(),
});

export const updateMasterRouterGridSchema = Joi.object().keys({
  data: Joi.array().items(updateMasterRouterGridSchemaData.required()),
});
