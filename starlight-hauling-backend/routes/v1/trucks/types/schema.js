import Joi from 'joi';

const id = Joi.number().integer().positive().min(1);

export const truckTypeSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    description: Joi.string().required(),
    businessLines: Joi.array()
      .items(
        Joi.object({
          id: id.required(),
          materialsIds: Joi.array().items(id),
          equipmentItemsIds: Joi.array().items(id),
        }),
      )
      .min(1)
      .required(),
  })
  .required();
