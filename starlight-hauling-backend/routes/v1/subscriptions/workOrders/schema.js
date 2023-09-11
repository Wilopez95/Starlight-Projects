import Joi from 'joi';
import { SUBSCRIPTION_WO_STATUSES } from '../../../../consts/workOrder.js';

const id = Joi.number().integer().positive();
export const editSubscriptionWorkOrderData = Joi.object()
  .keys({
    serviceDate: Joi.date().required(),
    instructionsForDriver: Joi.string().allow(null),
    assignedRoute: Joi.string().required().allow(null),
    lineItems: Joi.array()
      .items(
        Joi.object().keys({
          id,
          billableLineItemId: id.required(),
          globalRatesLineItemsId: id.required(),
          customRatesGroupLineItemsId: id.allow(null),
          materialId: id.allow(null).optional(),
          price: Joi.number().positive().required(),
          quantity: Joi.number().positive().required(),
        }),
      )
      .default([]),
  })
  .required();

export const changeStatusData = Joi.object().keys({
  status: Joi.string()
    .valid(...SUBSCRIPTION_WO_STATUSES)
    .required(),
  blockingReason: Joi.string(),
});
