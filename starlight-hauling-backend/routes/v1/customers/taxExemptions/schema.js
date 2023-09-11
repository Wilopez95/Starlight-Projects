import Joi from 'joi';

export const taxExemptionsData = Joi.object()
  .keys({
    enabled: Joi.boolean().required(),
    authNumber: Joi.string().when('enabled', {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null),
    }),
    author: Joi.string().allow(null, ''),
    timestamp: Joi.date().allow(null),
    imageUrl: Joi.string().uri().allow(null),
    nonGroup: Joi.array().items(
      Joi.object().keys({
        enabled: Joi.boolean().required(),
        authNumber: Joi.string().when('enabled', {
          is: true,
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null),
        }),
        author: Joi.string().allow(null, ''),
        timestamp: Joi.date().allow(null),
        imageUrl: Joi.string().uri().allow(null),
      }),
    ),
  })
  .required();

export const taxExemptionsPostData = Joi.object()
  .keys({
    authNumber: Joi.string().allow(null),
    author: Joi.string().allow(null),
    timestamp: Joi.date().allow(null),
    imageUrl: Joi.string().uri().allow(null),
    nonGroup: Joi.array().items(
      Joi.object().keys({
        enabled: Joi.boolean().optional(),
        authNumber: Joi.string().allow(null),
        author: Joi.string().allow(null, ''),
        timestamp: Joi.date().allow(null),
        imageUrl: Joi.string().uri().allow(null),
        taxDistrictId: Joi.number().allow(null),
      }),
    ),
  })
  .required();
