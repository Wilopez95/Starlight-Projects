import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { JOI_DATE_FORMAT } from '../../../consts/formats.js';

const Joi = BaseJoi.extend(JoiDate);

const date = Joi.date().format(JOI_DATE_FORMAT);
const id = Joi.number().integer().positive();

export const getDailyRoutesSchema = Joi.object()
  .keys({
    serviceDate: date.required(),
    driverId: id,
  })
  .required();
