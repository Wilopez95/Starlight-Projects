import Joi from 'joi';
import { THRESHOLD_SETTINGS } from '../../../consts/thresholdSettings.js';

const id = Joi.number().integer().positive();
const amount = Joi.number().integer().min(10_000).allow(0).allow(null).required();

export const calculateOrderPricesSchema = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  customerId: id.required(),
  jobSiteId: id.required(),
  customerJobSiteId: id.required().allow(null),
  applySurcharges: Joi.boolean().required(),
  applyTaxes: Joi.boolean().default(true),

  orders: Joi.array()
    .items(
      Joi.object()
        .keys({
          priceGroupId: id.required().allow(null),
          serviceDate: Joi.date().required(),
          orderId: id.required().allow(null),
          billableServiceId: id.required(),
          equipmentItemId: id.required(),
          materialId: id.required().allow(null),
          price: amount,
          quantity: Joi.number().integer().positive().allow(0).required(),
          applySurcharges: Joi.boolean().required(),
          materialBasedPricing: Joi.boolean().required(),
          needRecalculatePrice: Joi.boolean().default(false),
          needRecalculateSurcharges: Joi.boolean().default(false),
          commercialTaxesUsed: Joi.boolean().default(true),

          lineItems: Joi.array()
            .items(
              Joi.object()
                .keys({
                  lineItemId: id.allow(null).required(),
                  billableLineItemId: id.required(),
                  materialId: id.allow(null).required(),
                  price: amount,
                  quantity: Joi.number().integer().positive().allow(0).required(),
                  applySurcharges: Joi.boolean().required(),
                  materialBasedPricing: Joi.boolean().required(),
                  needRecalculatePrice: Joi.boolean().default(false),
                  needRecalculateSurcharges: Joi.boolean().default(false),
                })
                .required(),
            )
            .default([]),

          thresholds: Joi.array()
            .items(
              Joi.object()
                .keys({
                  thresholdItemId: id.allow(null).required(),
                  thresholdId: id.required(),
                  materialId: id.allow(null).required(),
                  equipmentItemId: id.allow(null).required(),
                  setting: Joi.string()
                    .valid(...THRESHOLD_SETTINGS)
                    .required(),
                  price: amount,
                  quantity: Joi.number().integer().positive().allow(0).required(),
                  isNetQuantity: Joi.boolean().default(true),
                  applySurcharges: Joi.boolean().required(),
                  needRecalculatePrice: Joi.boolean().default(false),
                  needRecalculateSurcharges: Joi.boolean().default(false),
                })
                .required(),
            )
            .default([]),
        })
        .required(),
    )
    .default([]),
});

export const calculateSubscriptionPricesSchema = Joi.object().keys({});

export const calculateSubscriptionOrderPricesSchema = Joi.object().keys({});
