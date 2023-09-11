import Joi from 'joi';

import { REMINDER_TYPES } from '../../../consts/reminderTypes.js';

const id = Joi.number().integer().positive();

export const getReminderSchema = Joi.object().keys({
  type: Joi.string().valid(...REMINDER_TYPES),
  entityId: id,
});

export const getUserRemindersSchema = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const createReminderSchema = Joi.object()
  .keys({
    type: Joi.string()
      .valid(...REMINDER_TYPES)
      .required(),
    entityId: id.required(),
    customerId: id.required(),
    jobSiteId: id,
    date: Joi.date().required(),
    informByApp: Joi.boolean(),
    informByEmail: Joi.boolean(),
    informBySms: Joi.boolean(),
  })
  .required();

export const editReminderSchema = Joi.object()
  .keys({
    date: Joi.date(),
    informByApp: Joi.boolean(),
    informByEmail: Joi.boolean(),
    informBySms: Joi.boolean(),
  })
  .required();

export const editUserReminderSchema = Joi.object()
  .keys({
    informedByAppAt: Joi.date(),
  })
  .required();
