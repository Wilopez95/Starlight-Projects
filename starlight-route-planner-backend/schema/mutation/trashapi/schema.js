import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { DAILY_ROUTE_STATUSES, DAILY_ROUTE_STATUS } from '../../../consts/dailyRoute.js';
import { WO_STATUS } from '../../../consts/workOrder.js';

const Joi = BaseJoi.extend(JoiDate);

export const updateDailyRouteInput = Joi.object().keys({
  status: Joi.string().valid(...DAILY_ROUTE_STATUSES),

  completedAt: Joi.string().when('status', {
    is: Joi.string().valid(DAILY_ROUTE_STATUS.completed).required(),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateWorkOrderSchema = Joi.object().keys({
  status: Joi.string().valid(WO_STATUS.completed, WO_STATUS.blocked, WO_STATUS.inProgress),
  comment: Joi.string(),
  media: Joi.string(),
  longitude: Joi.number(),
  latitude: Joi.number(),
});
