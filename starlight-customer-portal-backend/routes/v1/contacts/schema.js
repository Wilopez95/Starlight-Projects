import Joi from 'joi';

import { PHONE_TYPES } from '../../../consts/phoneTypes.js';

const id = Joi.number().integer().positive().required();

export const contactsRecords = Joi.object()
  .keys({
    customerId: id,
    activeOnly: Joi.boolean().optional(),
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
  })
  .required();

export const contactRecord = Joi.object()
  .keys({
    customerId: id,
  })
  .required();

const phoneNumbers = Joi.array()
  .items(
    Joi.object()
      .keys({
        id: Joi.number().integer().positive(),
        type: Joi.string()
          .valid(...PHONE_TYPES)
          .required(),
        number: Joi.string().required(),
        extension: Joi.string().allow(null).default(null),
        textOnly: Joi.boolean().default(true),
      })
      .required(),
  )
  .max(5);

export const contactData = Joi.object()
  .keys({
    customerId: id,

    active: Joi.boolean().required().default(true),
    main: Joi.boolean().required().default(false),

    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    jobTitle: Joi.string().allow(null),

    phoneNumbers: Joi.when('main', {
      is: true,
      then: phoneNumbers.min(1).required(),
    }).when('main', {
      is: false,
      then: phoneNumbers,
    }),
    allowCustomerPortal: Joi.boolean().required().default(false),
    allowContractorApp: Joi.boolean().required().default(false),
    email: Joi.string().email().allow(null),
  })
  .required();

export const myContactData = Joi.object()
  .keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    jobTitle: Joi.string().allow(null),

    main: Joi.boolean().required().default(false),
    allowContractorApp: Joi.boolean().required().default(false),
    phoneNumbers: Joi.when('main', {
      is: true,
      then: phoneNumbers.min(1).required(),
    }).when('main', {
      is: false,
      then: phoneNumbers,
    }),
  })
  .required();
