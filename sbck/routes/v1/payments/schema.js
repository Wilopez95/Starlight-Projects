import Joi from 'joi';

import { PAYMENT_TYPES, PaymentType } from '../../../consts/paymentTypes.js';
import { PAYMENT_METHODS, PaymentMethod } from '../../../consts/paymentMethod.js';
import { PAYMENT_GATEWAYS } from '../../../consts/paymentGateways.js';

const id = Joi.number().integer().positive();

export const checkPrepaid = Joi.array()
  .items(
    Joi.object()
      .keys({
        id: id.required(),
        customerId: id.required(),
        // TODO: remove this field.
        customerOriginalId: id.required(),
        grandTotal: Joi.number().min(0).required(),
      })
      .required(),
  )
  .required();

export const placeOrders = Joi.object()
  .keys({
    customerId: id.required(),

    orders: Joi.array().items(
      Joi.object()
        .keys({
          id: id.required(),
          woNumber: id.allow(null),
          poNumber: Joi.string().allow(null),
          beforeTaxesTotal: Joi.number().min(0).required(),
          surchargesTotal: Joi.number().min(0).required(),
          grandTotal: Joi.number().min(0).required(),
          onAccountTotal: Joi.number().min(0).required(),
          overrideCreditLimit: Joi.boolean().default(false),
          serviceDate: Joi.date().required(),
          businessLineId: id.required(),

          jobSiteId: id.required(),
          customerJobSite: Joi.object()
            .keys({
              id: id.required(),
              customerId: id.required(),
              jobSiteId: id.required(),
              sendInvoicesToJobSite: Joi.boolean().default(true),
              invoiceEmails: Joi.array().items(Joi.string().email()).allow(null),
            })
            .required(),

          lineItems: Joi.array()
            .items(
              Joi.object()
                .keys({
                  isService: Joi.boolean().required(),
                  description: Joi.string().required(),
                  price: Joi.number().min(0).required(),
                  quantity: Joi.number().required(),
                  total: Joi.number().min(0).required(),

                  billableServiceHistoricalId: id.allow(null),
                  billableLineItemHistoricalId: id.allow(null),
                })
                .required(),
            )
            .min(1)
            .required(),
        })
        .required(),
    ),

    payments: Joi.array()
      .items(
        Joi.object().keys({
          paymentMethod: Joi.valid(...PAYMENT_METHODS).required(),
          amount: Joi.number().min(0).required(),
          checkNumber: Joi.when('paymentMethod', {
            is: PaymentMethod.CHECK,
            then: Joi.string().required(),
          }),
          isAch: Joi.when('paymentType', {
            is: PaymentMethod.check,
            then: Joi.boolean().required(),
          }).allow(null),
          creditCardId: Joi.when('paymentType', {
            is: PaymentType.CREDIT_CARD,
            then: id,
          }).allow(null),
          newCreditCard: Joi.when('paymentType', {
            is: PaymentType.CREDIT_CARD,
            then: Joi.object()
              .keys({
                active: Joi.boolean().required(),
                cardNickname: Joi.string(),

                addressLine1: Joi.string().required(),
                addressLine2: Joi.string().allow(null).default(null),
                city: Joi.string().required(),
                state: Joi.string().required(),
                zip: Joi.string().min(5).required(),

                nameOnCard: Joi.string().required(),
                expirationDate: Joi.string().max(4).required(),
                cardNumber: Joi.string().required(),
                cvv: Joi.string().min(3).max(4).required(),
              })
              .allow(null),
          }).allow(null),
          authorizeCard: Joi.boolean().default(false),
          sendReceipt: Joi.boolean().required(),
          deferredPayment: Joi.boolean().default(false),
          deferredUntil: Joi.when('deferredPayment', {
            is: true,
            then: Joi.date().required(),
          }),
        }),
      )
      .max(3)
      .required(),
  })
  .required();

export const paymentId = Joi.object().keys({ id }).required();

export const prepaidPayment = Joi.object()
  .keys({
    refundedPaymentId: id.required(),

    orderId: id.required(),
    customerId: id.required(),

    paymentType: Joi.string()
      .valid(...PAYMENT_TYPES)
      .required(),

    date: Joi.date().required(),

    checkNumber: Joi.when('paymentType', {
      is: PaymentType.CHECK,
      then: Joi.string().required(),
    }).allow(null),
    isAch: Joi.when('paymentType', {
      is: PaymentType.CHECK,
      then: Joi.boolean().required(),
    }).allow(null),

    creditCardId: Joi.when('paymentType', {
      is: PaymentType.CREDIT_CARD,
      then: id,
    }).allow(null),
    newCreditCard: Joi.when('paymentType', {
      is: PaymentType.CREDIT_CARD,
      then: Joi.object()
        .keys({
          active: Joi.boolean().required(),
          cardNickname: Joi.string(),

          addressLine1: Joi.string().required(),
          addressLine2: Joi.string().allow(null).default(null),
          city: Joi.string().required(),
          state: Joi.string().required(),
          zip: Joi.string().min(5).required(),

          nameOnCard: Joi.string().required(),
          expirationDate: Joi.string().max(4).required(),
          cardNumber: Joi.string().required(),
          cvv: Joi.string().min(3).max(4).required(),
        })
        .allow(null),
    }).allow(null),
  })
  .required();

export const updateDeferred = Joi.object()
  .keys({
    orderId: id.required(),
    grandTotal: Joi.number().min(0).required(),

    deferredUntil: Joi.date().required(),
    serviceDate: Joi.date().required(),

    date: Joi.date().required(),

    paymentType: Joi.string()
      .valid(...PAYMENT_TYPES.filter(p => p !== PaymentType.CREDIT_MEMO))
      .required(),

    checkNumber: Joi.when('paymentType', {
      is: PaymentType.CHECK,
      then: Joi.string().required(),
    }).allow(null),
    isAch: Joi.when('paymentType', {
      is: PaymentType.CHECK,
      then: Joi.boolean().required(),
    }).allow(null),

    creditCardId: Joi.when('paymentType', {
      is: PaymentType.CREDIT_CARD,
      then: id,
    }).allow(null),
    newCreditCard: Joi.when('paymentType', {
      is: PaymentType.CREDIT_CARD,
      then: Joi.object()
        .keys({
          active: Joi.boolean().required(),
          cardNickname: Joi.string(),

          addressLine1: Joi.string().required(),
          addressLine2: Joi.string().allow(null).default(null),
          city: Joi.string().required(),
          state: Joi.string().required(),
          zip: Joi.string().min(5).required(),

          nameOnCard: Joi.string().required(),
          expirationDate: Joi.string().max(4).required(),
          cardNumber: Joi.string().required(),
          cvv: Joi.string().min(3).max(4).required(),
        })
        .allow(null),
    }).allow(null),
  })
  .required();

export const getPaymentsParams = Joi.object().keys({
  deferredOnly: Joi.boolean(),
});

export const merchantData = Joi.object()
  .keys({
    paymentGateway: Joi.string()
      .valid(...PAYMENT_GATEWAYS)
      .required(),
    mid: Joi.string().allow(null),
    username: Joi.string().when('mid', {
      is: Joi.string().required(),
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null),
    }),
    password: Joi.string().when('mid', {
      is: Joi.string().required(),
      then: Joi.string().required().allow(null),
      otherwise: Joi.string().allow(null),
    }),
    salespointMid: Joi.string().allow(null),
    salespointUsername: Joi.when('salespointMid', {
      is: Joi.string().required(),
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null),
    }),
    salespointPassword: Joi.when('salespointMid', {
      is: Joi.string().required(),
      then: Joi.string().required().allow(null),
      otherwise: Joi.string().allow(null),
    }),
    raw: Joi.boolean().default(false),
  })
  .required();

export const unDeferredPaymentData = Joi.object()
  .keys({
    nonCanceledOrders: Joi.array()
      .items(
        Joi.object().keys({ id: Joi.number().required(), grandTotal: Joi.number().required() }),
      )
      .allow(null),
  })
  .required();
