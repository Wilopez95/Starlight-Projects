import Joi from 'joi';

import { EQUIPMENT_TYPES } from '../../../consts/equipmentTypes.js';

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const equipmentItemData = Joi.object()
  .keys({
    businessLineId: Joi.number().integer().positive().required(),

    active: Joi.boolean().required(),
    customerOwned: Joi.boolean().default(false),
    description: Joi.string().required(),
    shortDescription: Joi.string().required(),

    type: Joi.string()
      .valid(...EQUIPMENT_TYPES)
      .required(),
    size: Joi.when('customerOwned', {
      is: false,
      then: Joi.number().positive().required(),
      otherwise: Joi.number().positive().allow(null),
    }),
    length: Joi.when('customerOwned', {
      is: false,
      then: Joi.number().required(),
      otherwise: Joi.number().allow(null),
    }),
    width: Joi.when('customerOwned', {
      is: false,
      then: Joi.number().required(),
      otherwise: Joi.number().allow(null),
    }),
    height: Joi.when('customerOwned', {
      is: false,
      then: Joi.number().required(),
      otherwise: Joi.number().allow(null),
    }),
    emptyWeight: Joi.when('customerOwned', {
      is: false,
      then: Joi.number().required(),
      otherwise: Joi.number().allow(null),
    }),

    closedTop: Joi.boolean().required(),
    imageUrl: Joi.string().uri().allow(null),

    containerTareWeightRequired: Joi.boolean().required(),
  })
  .required();
