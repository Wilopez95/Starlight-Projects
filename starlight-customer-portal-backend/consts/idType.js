import Joi from 'joi';

const id = Joi.object()
  .keys({
    id: Joi.number().integer().positive().required(),
  })
  .required();

export default id;
