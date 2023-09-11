import Joi from 'joi';
import { WEIGHT_UNITS } from '../../../../../consts/workOrder.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../../../consts/orderStatuses.js';
import { REASON_TYPES } from '../../../../../consts/cancelReasons.js';

const id = Joi.number().integer().positive();

export const completeOrderData = Joi.object().keys({
  noBillableService: Joi.boolean().required(),
  materialId: id.allow(null),
  promoId: id.allow(null).required(),
  unlockOverrides: Joi.boolean(),
  instructionsForDriver: Joi.string().allow(null).required(),
  invoiceNotes: Joi.string().allow(null),
  destinationJobSiteId: Joi.when('noBillableService', {
    is: false,
    then: id.allow(null).optional(),
  }),
  billableServiceId: Joi.when('noBillableService', {
    is: false,
    then: id.required(),
  }),
  overrideCreditLimit: Joi.boolean().default(false).allow(null),
  completionFields: Joi.when('noBillableService', {
    is: false,
    then: Joi.object()
      .keys({
        droppedEquipmentItem: Joi.string().allow(null).required(),
        pickedUpEquipmentItem: Joi.string().allow(null).required(),

        weight: Joi.number().allow(null).required(),
        weightUnit: Joi.string()
          .allow(null)
          .valid(...WEIGHT_UNITS)
          .required(),

        startedAt: Joi.date().allow(null).required(),
        arrivedAt: Joi.date().allow(null).required(),
        startServiceDate: Joi.date().allow(null).required(),
        finishWorkOrderDate: Joi.date().allow(null).required(),
      })
      .required(),
  }),
  lineItems: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableLineItemId: id.required(),
        materialId: id.required().allow(null),
        globalRatesLineItemsId: id.required(),
        customRatesGroupLineItemsId: id.allow(null).required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
      }),
    )
    .default([]),
  mediaFiles: Joi.array().items(
    Joi.object().keys({
      url: Joi.string().required(),
      timestamp: Joi.date().allow(null),
      author: Joi.string().allow(null),
      fileName: Joi.string(),
    }),
  ),
});

export const comment = Joi.object().keys({
  comment: Joi.string().optional().allow(null),
});

export const unCompleteData = Joi.object().keys({
  status: Joi.string()
    .valid(SUBSCRIPTION_ORDER_STATUS.scheduled, SUBSCRIPTION_ORDER_STATUS.inProgress)
    .required(),
  comment: Joi.string().optional().allow(null),
});

export const cancelOrderData = Joi.object()
  .keys({
    reasonType: Joi.string()
      .valid(...REASON_TYPES)
      .required(),
    comment: Joi.string().optional().allow(null),
    addTripCharge: Joi.boolean().required().default(true),
  })
  .required();
