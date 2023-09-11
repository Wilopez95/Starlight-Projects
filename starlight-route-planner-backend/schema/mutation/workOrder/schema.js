import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { JOI_DATE_FORMAT } from '../../../consts/formats.js';
import {
  SUBSCRIPTION_WO_STATUSES,
  SUBSCRIPTION_WO_STATUS,
  CANCELLATION_REASONS,
  CANCELLATION_REASON,
} from '../../../consts/workOrder.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().format(JOI_DATE_FORMAT).utc();
const id = Joi.number().integer().positive();

export const updateWorkOrderSchema = Joi.object().keys({
  id: id.required(),
  status: Joi.string().valid(...SUBSCRIPTION_WO_STATUSES),
  serviceDate: Joi.string(),
  assignedRoute: Joi.string().allow(null),
  cancellationReason: Joi.string().when('status', {
    is: Joi.string().valid(SUBSCRIPTION_WO_STATUS.canceled).required(),
    then: Joi.string()
      .valid(...CANCELLATION_REASONS)
      .required(),
    otherwise: Joi.forbidden(),
  }),
  cancellationComment: Joi.string().when('cancellationReason', {
    is: Joi.string().valid(CANCELLATION_REASON.other).required(),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  pickedUpEquipment: Joi.string().allow(null),
  droppedEquipment: Joi.string().allow(null),
  weight: Joi.number().allow(null),
});

export const bulkStatusChange = Joi.object().keys({
  ids: Joi.array().items(id.required()),
  status: Joi.string().valid(...SUBSCRIPTION_WO_STATUSES),
  cancellationReason: Joi.string().when('status', {
    is: Joi.string().valid(SUBSCRIPTION_WO_STATUS.canceled).required(),
    then: Joi.string()
      .valid(...CANCELLATION_REASONS)
      .required(),
    otherwise: Joi.forbidden(),
  }),
  cancellationComment: Joi.string().when('cancellationReason', {
    is: Joi.string().valid(CANCELLATION_REASON.other).required(),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const bulkReschedule = Joi.object().keys({
  ids: Joi.array().items(id.required()),
  serviceDate: date,
});
