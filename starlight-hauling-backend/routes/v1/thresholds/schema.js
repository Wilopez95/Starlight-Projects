import Joi from 'joi';

import { RECYCLING_ACTIONS } from '../../../consts/actions.js';

const id = Joi.number().integer().positive();

export const calcThresholdsParams = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  customRatesGroupId: id.required().allow(null),
  materialId: id.required(),
  netWeight: Joi.number().required(),
  action: Joi.string()
    .valid(...RECYCLING_ACTIONS)
    .required(),
});
