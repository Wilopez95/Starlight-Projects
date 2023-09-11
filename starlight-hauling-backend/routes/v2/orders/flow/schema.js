import Joi from 'joi';

import { ORDER_STATUSES } from '../../../../consts/orderStatuses.js';
import { WEIGHT_UNITS } from '../../../../consts/workOrder.js';
import { REASON_TYPES } from '../../../../consts/cancelReasons.js';
import { ACTIONS } from '../../../../consts/actions.js';
import { PAYMENT_METHOD, PAYMENT_METHODS } from '../../../../consts/paymentMethods.js';
import { INDEPENDENT_WO_STATUSES } from '../../../../consts/independentWorkOrder.js';

const id = Joi.number().integer().positive();
const price = Joi.number().integer().positive().allow(0);

export const cancelOrderData = Joi.object()
  .keys({
    reasonType: Joi.string()
      .valid(...REASON_TYPES)
      .required(),
    comment: Joi.string().optional().allow(null),
    addTripCharge: Joi.boolean().required().default(true),
  })
  .required();

export const completeOrderData = Joi.object().keys({
  // to optimize endpoint: avoid extra DB call
  noBillableService: Joi.boolean().required(),
  applySurcharges: Joi.boolean().required(),
  action: Joi.when('noBillableService', {
    is: false,
    then: Joi.string()
      .valid(...ACTIONS)
      .required(),
  }),

  materialId: Joi.when('noBillableService', {
    is: false,
    then: id.required(),
  }),
  billableServiceId: Joi.when('noBillableService', {
    is: false,
    then: id.required(),
  }),
  billableServicePrice: Joi.when('noBillableService', {
    is: false,
    then: price.required(),
  }),
  billableServiceApplySurcharges: Joi.when('noBillableService', {
    is: false,
    then: Joi.boolean().required(),
  }),
  projectId: Joi.when('noBillableService', {
    is: false,
    then: id.allow(null).required(),
  }),
  promoId: id.allow(null).required(),

  disposalSiteId: Joi.when('noBillableService', {
    is: false,
    then: id.allow(null).required(),
  }),
  jobSite2Id: Joi.when('noBillableService', {
    is: false,
    then: id.allow(null).optional(),
  }),

  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .allow(null)
    .required(),
  customerId: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.onAccount,
    then: id.required(),
  }).allow(null),
  overrideCreditLimit: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.onAccount,
    then: Joi.boolean().default(false),
  }).allow(null),
  grandTotal: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.onAccount,
    then: price.required(),
  }).allow(null),
  isRollOff: Joi.boolean().required(),

  workOrder: Joi.when('noBillableService', {
    is: false,
    then: Joi.object()
      .keys({
        id: id.required(),
        woNumber: Joi.number().integer(),
        route: Joi.when('isRollOff', {
          is: false,
          then: Joi.string().allow(null).optional(),
          otherwise: id.allow(null).required(),
        }),
        completionDate: Joi.date().allow(null).required(),
        truckId: Joi.when('isRollOff', { is: true, then: id.allow(null).required() }),
        driverId: Joi.when('isRollOff', { is: true, then: id.allow(null).required() }),

        droppedEquipmentItem: Joi.string().allow(null).required(),
        pickedUpEquipmentItem: Joi.string().allow(null).required(),

        weight: Joi.number().allow(null).required(),
        weightUnit: Joi.string()
          .allow(null)
          .valid(...WEIGHT_UNITS)
          .required(),
        startWorkOrderDate: Joi.when('isRollOff', {
          is: false,
          then: Joi.date().allow(null).required(),
          otherwise: Joi.date().allow(null).optional(),
        }),
        arriveOnSiteDate: Joi.when('isRollOff', {
          is: false,
          then: Joi.date().allow(null).required(),
          otherwise: Joi.date().allow(null).optional(),
        }),
        startServiceDate: Joi.when('isRollOff', {
          is: false,
          then: Joi.date().allow(null).required(),
          otherwise: Joi.date().allow(null).optional(),
        }),
        finishWorkOrderDate: Joi.when('isRollOff', {
          is: false,
          then: Joi.date().allow(null).required(),
          otherwise: Joi.date().allow(null).optional(),
        }),

        ticket: Joi.when('isRollOff', {
          is: true,
          then: Joi.string().allow(null).required(),
        }),
        ticketUrl: Joi.when('isRollOff', {
          is: true,
          then: Joi.string().allow(null).default(null),
        }),
        mediaFiles: Joi.array().items(
          Joi.object().keys({
            url: Joi.string().required(),
            timestamp: Joi.date().allow(null),
            author: Joi.string().allow(null),
            fileName: Joi.string(),
          }),
        ),
      })
      .required(),
  }),

  // driver notes: computed and read-only prop
  driverInstructions: Joi.string().allow(null).required(), // CSR note
  invoiceNotes: Joi.string().allow(null).required(),

  lineItems: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableLineItemId: id.required(),
        materialId: id.required().allow(null),
        priceId: id.required(),
        price: price.required(),
        quantity: Joi.number().positive().required(),
        applySurcharges: Joi.boolean().required(),
        manifestNumber: Joi.string().allow(null),
      }),
    )
    .default([]),

  thresholds: Joi.when('noBillableService', {
    is: false,
    then: Joi.array()
      .items(
        Joi.object().keys({
          id: id.required(),
          thresholdId: id,
          threshold: Joi.object().keys({
            id,
            originalId: id,
          }),
          price: price.required(),
          quantity: Joi.number().positive().required(),
          applySurcharges: Joi.boolean().required(),
        }),
      )
      .default([]),
  }),

  manifestItems: Joi.array()
    .items(
      Joi.object().keys({
        id: id.required(),
        workOrderId: id.required(),
        materialId: id.required(),
        dispatchId: id.required().allow(null),
        url: Joi.string().required(),
        manifestNumber: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitType: Joi.string().valid('tons', 'yards').required(),
      }),
    )
    .default([])
    .allow(null)
    .optional(),

  newManifestItems: Joi.array()
    .items(
      Joi.object().keys({
        workOrderId: id.required(),
        materialId: id.required(),
        manifestNumber: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitType: Joi.string().valid('ton', 'yard').required(), // TODO: align unitType enum
      }),
    )
    .default([])
    .allow(null)
    .optional(),
});

export const changeStatusData = Joi.object().keys({
  status: Joi.string()
    .valid(...ORDER_STATUSES, ...INDEPENDENT_WO_STATUSES)
    .required(),
});

export const comment = Joi.object().keys({
  comment: Joi.string().optional().allow(null),
});
