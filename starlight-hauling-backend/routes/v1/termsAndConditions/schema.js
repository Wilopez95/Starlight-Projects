import Joi from 'joi';

export const createdTermsAndConditions = Joi.object().keys({
  tcAck: Joi.boolean(),
  tcAckTimestamp: Joi.date().allow(null),
  tcAckPdfUrl: Joi.string().allow(null),
  tcPhone: Joi.string().allow(null),
  tcEmail: Joi.string().allow(null),
});

export const updatedTermsAndConditions = Joi.object().keys({
  tcAck: Joi.boolean().optional(),
  tcAckTimestamp: Joi.date().optional().allow(null),
  tcAckPdfUrl: Joi.string().optional().allow(null),
  tcPhone: Joi.string().optional().allow(null),
  tcEmail: Joi.string().optional().allow(null),
});
