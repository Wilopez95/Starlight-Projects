import Joi from 'joi';

import { PHONE_TYPES } from '../../../consts/phoneTypes.js';
import { AUTO_PAY_TYPES } from '../../../consts/customerAutoPayTypes.js';

const phoneNumber = Joi.object()
  .keys({
    type: Joi.string()
      .valid(...PHONE_TYPES)
      .required(),
    number: Joi.string().required(),
    extension: Joi.string().allow(null).default(null),
    textOnly: Joi.boolean().default(true),
  })
  .required();

const phoneNumberList = Joi.array().items(phoneNumber).min(1).max(5).required();

export const customerData = Joi.object()
  .keys({
    contactId: Joi.number().integer().positive().required(),
    businessUnitId: Joi.number().integer().positive().required(),
    commercial: Joi.boolean().required(), // tech field
    email: Joi.string().email().allow(null),

    firstName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }).when('commercial', {
      is: true,
      then: Joi.allow(null).default(null),
    }),
    lastName: Joi.when('commercial', {
      is: false,
      then: Joi.string().required(),
    }).when('commercial', {
      is: true,
      then: Joi.allow(null).default(null),
    }),
    businessName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }).when('commercial', {
      is: false,
      then: Joi.allow(null).default(null),
    }),

    mainFirstName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    mainLastName: Joi.when('commercial', {
      is: true,
      then: Joi.string().required(),
    }),
    mainJobTitle: Joi.when('commercial', {
      is: true,
      then: Joi.string().allow(null),
    }),
    mainEmail: Joi.when('commercial', {
      is: true,
      then: Joi.string().email(),
    }),

    mainPhoneNumbers: Joi.when('commercial', {
      is: true,
      then: phoneNumberList,
    }),

    phoneNumbers: phoneNumberList,

    mailingAddress: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().min(5).required(),
      })
      .required(),

    billingAddress: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().min(5).required(),
      })
      .required(),

    isAutopayExist: Joi.boolean(),
    autopayType: Joi.when('isAutopayExist', {
      is: true,
      then: Joi.string()
        .valid(...AUTO_PAY_TYPES)
        .required(),
    }),
    autopayCreditCardId: Joi.when('isAutopayExist', {
      is: true,
      then: Joi.number().integer().positive().required(),
    }),
  })
  .required();
