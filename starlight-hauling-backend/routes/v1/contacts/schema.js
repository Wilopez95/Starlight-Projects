import Joi from 'joi';

import { PHONE_TYPES } from '../../../consts/phoneTypes.js';

export const queryParams = Joi.object()
  .keys({
    customerId: Joi.number().integer().positive(),
    activeOnly: Joi.boolean().optional(),

    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
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
        // TODO: complement with advanced validation
        number: Joi.string().required(),
        extension: Joi.string().allow(null).default(null),
        textOnly: Joi.boolean().default(true),
      })
      .required(),
  )
  .max(5);

export const contactData = Joi.object()
  .keys({
    customerId: Joi.number().integer().positive(),

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

    allowContractorApp: Joi.boolean().required().default(false),

    allowCustomerPortal: Joi.boolean().required().default(false),

    email: Joi.when('allowContractorApp', {
      is: true,
      then: Joi.string().email().required(),
    })
      .when('allowContractorApp', {
        is: false,
        then: Joi.allow(null),
      })
      .when('allowCustomerPortal', {
        is: true,
        then: Joi.string().email().required(),
      })
      .when('allowCustomerPortal', {
        is: false,
        then: Joi.allow(null),
      }),
  })
  .required();
